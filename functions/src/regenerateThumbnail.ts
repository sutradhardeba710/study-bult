import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';


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

/**
 * HTTP Callable Cloud Function to regenerate thumbnail for an existing paper
 * This allows admins to generate thumbnails for papers uploaded before the feature existed
 */
export const regenerateThumbnail = functions.runWith({
    timeoutSeconds: 120,
    memory: '1GB'
}).https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to regenerate thumbnails.'
        );
    }

    // Get the caller's user info to verify admin status
    const callerUid = context.auth.uid;
    const callerToken = await admin.auth().getUser(callerUid);

    // Check if caller has admin role
    let isAdmin = false;

    if (callerToken.customClaims && callerToken.customClaims.admin === true) {
        isAdmin = true;
    } else {
        // Check Firestore for admin role as fallback
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
        if (callerDoc.exists && callerDoc.data()?.role === 'admin') {
            isAdmin = true;
        }
    }

    if (!isAdmin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can regenerate thumbnails.'
        );
    }

    // Get the paper ID
    const paperId = data.paperId;

    if (!paperId || typeof paperId !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Paper ID is required and must be a string.'
        );
    }

    const db = admin.firestore();
    const logRef = db.collection('system_logs').doc();

    try {
        // Get the paper document
        const paperDoc = await db.collection('papers').doc(paperId).get();

        if (!paperDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                `Paper with ID ${paperId} not found.`
            );
        }

        const paperData = paperDoc.data();
        let storagePath = paperData?.storagePath;
        const fileName = paperData?.fileName;

        if (!storagePath && paperData?.fileUrl) {
            // Try to extract storage path from URL
            // URL format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/papers%2FUSER%2FFILE.pdf?alt=...
            try {
                const urlObj = new URL(paperData.fileUrl);
                const pathName = urlObj.pathname;
                // Decode the path (it's double encoded in some cases)
                const decodedPath = decodeURIComponent(pathName);
                // Remove the bucket prefix (/v0/b/BUCKET/o/ or just find papers/)
                let match = decodedPath.match(/\/o\/(.+)$/);
                if (!match) {
                    match = decodedPath.match(/(papers\/.+)$/);
                }

                if (match && match[1]) {
                    storagePath = match[1];
                    functions.logger.info(`Derived storagePath from URL: ${storagePath}`);
                }
            } catch (e) {
                functions.logger.warn('Failed to parse fileUrl:', e);
            }
        }

        if (!storagePath) {
            // Last resort: try to construct it if we have userId and fileName
            if (paperData?.uploaderId && paperData?.fileName) {
                storagePath = `papers/${paperData.uploaderId}/${paperData.fileName}`;
                functions.logger.info(`Constructed storagePath fallback: ${storagePath}`);
            } else {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Paper does not have a storagePath in Firestore and it could not be derived.'
                );
            }
        }

        // --- SANITIZE STORAGE PATH ---
        // Sometimes the storagePath in Firestore (or derived) accidentally includes the bucket name
        // e.g., "studyvault-4ec70.firebasestorage.app/papers/..."
        if (storagePath) {
            const papersIndex = storagePath.indexOf('papers/');
            if (papersIndex > 0) {
                storagePath = storagePath.substring(papersIndex);
                functions.logger.info(`Stripped prefix from storagePath: ${storagePath}`);
            } else if (storagePath.startsWith('/')) {
                // Also ensure it doesn't start with a leading slash
                storagePath = storagePath.substring(1);
            }
        }
        // -----------------------------

        await logRef.set({
            type: 'thumbnail_regeneration_start',
            paperId,
            storagePath,
            callerUid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        functions.logger.info(`Regenerating thumbnail for paper ${paperId} at ${storagePath}`);

        const bucket = admin.storage().bucket();

        // --- ADDED FALLBACK FOR MISSING .pdf EXTENSION ---
        let exists = false;
        try {
            const [existResult] = await bucket.file(storagePath).exists();
            exists = existResult;
        } catch (e) {
            functions.logger.warn(`Error checking existence of ${storagePath}:`, e);
        }

        if (!exists && !storagePath.endsWith('.pdf')) {
            const pathWithPdf = storagePath + '.pdf';
            try {
                const [existsWithPdf] = await bucket.file(pathWithPdf).exists();
                if (existsWithPdf) {
                    storagePath = pathWithPdf;
                    functions.logger.info(`Found file by appending .pdf: ${storagePath}`);
                    // Save correct path for future uses
                    await paperDoc.ref.update({ storagePath });
                }
            } catch (e) {
                functions.logger.warn(`Error checking existence of ${pathWithPdf}:`, e);
            }
        }
        // ------------------------------------------------

        const tempFilePath = path.join(os.tmpdir(), fileName || path.basename(storagePath));

        // Download PDF from storage
        await bucket.file(storagePath).download({ destination: tempFilePath });

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
        // Canvas is already required above
        const finalCanvas = createCanvas(scaledViewport.width, scaledViewport.height);
        const finalContext = finalCanvas.getContext('2d');

        // 1. Fill with white background
        finalContext.fillStyle = '#FFFFFF';
        finalContext.fillRect(0, 0, scaledViewport.width, scaledViewport.height);

        // 2. Draw the PDF render on top
        finalContext.drawImage(canvas, 0, 0);

        // Convert final canvas to PNG buffer
        // @ts-ignore
        const thumbnailBuffer = finalCanvas.toBuffer('image/png');

        // Generate thumbnail path using organized structure for ALL papers
        // Format: thumbnails/YEAR/MONTH/SUBJECT/file.png

        let thumbnailPath: string;
        const thumbnailFileName = fileName ? fileName.replace('.pdf', '.png') : path.basename(storagePath).replace('.pdf', '.png');

        functions.logger.info('Paper Data for path generation:', {
            createdAt: paperData?.createdAt,
            subject: paperData?.subject,
            fileName,
            storagePath
        });

        // Determine the date for folder structure
        let dateObj = new Date();

        if (paperData?.createdAt) {
            // 1. Try Firestore Timestamp
            if (typeof paperData.createdAt.toDate === 'function') {
                dateObj = paperData.createdAt.toDate();
            }
            // 2. Try standard Date object
            else if (paperData.createdAt instanceof Date) {
                dateObj = paperData.createdAt;
            }
            // 3. Try parsing string
            else if (typeof paperData.createdAt === 'string') {
                const parsed = new Date(paperData.createdAt);
                if (!isNaN(parsed.getTime())) {
                    dateObj = parsed;
                }
            }
        } else {
            // 4. Fallback: Try to extract timestamp from legacy storage path
            // Legacy format: papers/USER_ID/TIMESTAMP_filename.pdf
            const basename = path.basename(storagePath);
            const timestampMatch = basename.match(/^(\d+)_/);
            if (timestampMatch && timestampMatch[1]) {
                const timestamp = parseInt(timestampMatch[1], 10);
                // Basic validation: timestamp should be reasonable (e.g. after 2020)
                // 1577836800000 is 2020-01-01
                if (timestamp > 1577836800000) {
                    dateObj = new Date(timestamp);
                    functions.logger.info(`Extracted date from filename: ${dateObj.toISOString()}`);
                }
            }
        }

        const year = dateObj.getFullYear();
        const month = dateObj.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

        // Get subject slug
        const subject = paperData?.subject
            ? paperData.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : 'uncategorized';

        // Get college slug
        const college = paperData?.college
            ? paperData.college.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            : 'uncategorized';

        // Always use the organized format: thumbnails/YEAR/MONTH/COLLEGE/SUBJECT/file.png
        thumbnailPath = `thumbnails/${year}/${month}/${college}/${subject}/${thumbnailFileName}`;
        functions.logger.info(`Generated organized thumbnail path: ${thumbnailPath}`);

        const thumbnailFile = bucket.file(thumbnailPath);

        await thumbnailFile.save(thumbnailBuffer, {
            metadata: {
                contentType: 'image/png',
                metadata: {
                    originalFile: storagePath,
                    generatedAt: new Date().toISOString(),
                    regeneratedBy: callerUid,
                },
            },
        });

        // Make the thumbnail public
        await thumbnailFile.makePublic();
        const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;

        functions.logger.info(`Thumbnail regenerated: ${thumbnailUrl}`);

        // Update the Firestore document
        await paperDoc.ref.update({ thumbnailUrl });

        await logRef.update({
            status: 'success',
            thumbnailUrl,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Cleanup
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        return {
            success: true,
            message: 'Thumbnail regenerated successfully',
            thumbnailUrl,
            paperId
        };

    } catch (error: any) {
        functions.logger.error('Error regenerating thumbnail:', error);

        await logRef.set({
            status: 'error',
            error: error.message || 'Unknown error',
            stack: error.stack || '',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Determine the appropriate error code
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        throw new functions.https.HttpsError(
            'internal',
            `Failed to regenerate thumbnail: ${error.message}`
        );
    }
});
