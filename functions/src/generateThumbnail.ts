import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';


// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Dynamic import for pdfjs-dist
let pdfjsLib: any;

class NodeCanvasFactory {
    create(width: number, height: number) {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        return {
            canvas,
            context,
        };
    }

    reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }

    destroy(canvasAndContext: any) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

export const generateThumbnail = functions.runWith({
    timeoutSeconds: 120,
    memory: '1GB'
}).storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // Exit if this is triggered on a file that is not a PDF.
    if (!contentType || !contentType.startsWith('application/pdf')) {
        console.log('This is not a PDF.');
        return;
    }

    // Exit if the file is not in the 'papers' folder
    if (!filePath || !filePath.startsWith('papers/')) {
        console.log('Not a PDF in papers folder, skipping');
        return;
    }

    const fileName = path.basename(filePath);
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const db = admin.firestore();
    const logRef = db.collection('system_logs').doc();

    try {
        await logRef.set({
            type: 'thumbnail_generation_start',
            filePath,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Generating thumbnail for:', filePath);

        // Download file from bucket.
        await bucket.file(filePath).download({ destination: tempFilePath });

        // ... inside function
        // Lazy load canvas
        const { createCanvas, Canvas, Image } = require('canvas');

        // Polyfills for pdfjs-dist
        // @ts-ignore
        global.Canvas = Canvas;
        // @ts-ignore
        global.Image = Image;

        // Load pdfjs-dist if not loaded
        if (!pdfjsLib) {
            pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
        }

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
            url: tempFilePath,
            cMapUrl: 'node_modules/pdfjs-dist/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/',
            disableFontFace: true,
            canvasFactory: new NodeCanvasFactory(),
        });

        const pdfDocument = await loadingTask.promise;
        const page = await pdfDocument.getPage(1);

        const viewport = page.getViewport({ scale: 1.0 });
        const scale = 300 / viewport.width; // Resize to 300px width
        const scaledViewport = page.getViewport({ scale });

        // Create canvas using factory
        const canvasFactory = new NodeCanvasFactory();
        const { canvas, context } = canvasFactory.create(scaledViewport.width, scaledViewport.height);

        // Render PDF page to canvas
        await page.render({
            canvasContext: context as any,
            viewport: scaledViewport,
            canvasFactory: canvasFactory as any,
        }).promise;

        // Create a new canvas for the white background composition
        const finalCanvas = createCanvas(scaledViewport.width, scaledViewport.height);
        const finalContext = finalCanvas.getContext('2d');

        // 1. Fill with white background
        finalContext.fillStyle = '#FFFFFF';
        finalContext.fillRect(0, 0, scaledViewport.width, scaledViewport.height);

        // 2. Draw the PDF render on top
        finalContext.drawImage(canvas, 0, 0);

        // Convert final canvas to PNG buffer (better for transparency)
        // @ts-ignore
        const thumbnailBuffer = finalCanvas.toBuffer('image/png');

        // Generate thumbnail path matching paper structure
        // Support:
        // 1. Newest format (papers/YEAR/MONTH/SUBJECT/COLLEGE/file.pdf)
        // 2. Previous format (papers/YEAR/MONTH/SUBJECT/file.pdf)
        // 3. Legacy format (papers/USER_ID/timestamp_file.pdf)
        const pathParts = filePath.replace('papers/', '').split('/');

        let thumbnailPath: string;
        if (pathParts.length >= 5 && /^\d{4}$/.test(pathParts[0])) {
            // Newest organized format: papers/YEAR/MONTH/COLLEGE/SUBJECT/filename.pdf
            const [year, month, college, subject, pdfFileName] = pathParts;
            thumbnailPath = `thumbnails/${year}/${month}/${college}/${subject}/${pdfFileName.replace('.pdf', '.png')}`;
        } else if (pathParts.length >= 4 && /^\d{4}$/.test(pathParts[0])) {
            // Previous organized format: papers/YEAR/MONTH/SUBJECT/filename.pdf
            const [year, month, subject, pdfFileName] = pathParts;
            thumbnailPath = `thumbnails/${year}/${month}/${subject}/${pdfFileName.replace('.pdf', '.png')}`;
        } else {
            // Legacy format: papers/USER_ID/filename.pdf
            const userId = pathParts[0];
            thumbnailPath = `thumbnails/${userId}/${fileName.replace('.pdf', '.png')}`;
        }

        const thumbnailFile = bucket.file(thumbnailPath);

        await thumbnailFile.save(thumbnailBuffer, {
            metadata: {
                contentType: 'image/png',
                metadata: {
                    originalFile: filePath,
                    generatedAt: new Date().toISOString(),
                },
            },
        });

        // Make the thumbnail public (optional, or use signed URLs)
        await thumbnailFile.makePublic();
        const thumbnailUrl = `https://storage.googleapis.com/${fileBucket}/${thumbnailPath}`;

        console.log('Thumbnail generated:', thumbnailUrl);

        // Update the Firestore document
        // We query by storagePath which is now saved during upload
        // Fallback to fileName is kept for legacy support (though likely unreliable for renamed files)
        let snapshot = await db.collection('papers')
            .where('storagePath', '==', filePath)
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log(`No document found with storagePath: ${filePath}. Trying fileName fallback...`);
            snapshot = await db.collection('papers')
                .where('fileName', '==', fileName)
                .limit(1)
                .get();
        }

        if (snapshot.empty) {
            console.warn(`Could not find paper document for ${filePath}`);
            await logRef.update({
                status: 'error',
                error: 'Paper document not found in Firestore',
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return;
        }

        const doc = snapshot.docs[0];
        await doc.ref.update({ thumbnailUrl });

        await logRef.update({
            status: 'success',
            thumbnailUrl,
            paperId: doc.id,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Cleanup
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

    } catch (error: any) {
        console.error('Error generating thumbnail:', error);
        await logRef.set({
            status: 'error',
            error: error.message || 'Unknown error',
            stack: error.stack || '',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Cleanup on error too
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
});
