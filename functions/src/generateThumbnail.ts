import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createCanvas } from 'canvas';
import * as path from 'path';

// Polyfill for Promise.withResolvers if needed (Node 20 might need it for latest pdfjs-dist)
if (typeof (Promise as any).withResolvers === 'undefined') {
    (Promise as any).withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// Initialize admin app if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

// Factory for creating Canvas/Image instances in Node environment
class NodeCanvasFactory {
    create(width: number, height: number) {
        if (width <= 0 || height <= 0) {
            throw new Error('Invalid canvas size');
        }
        const canvas = createCanvas(width, height);
        return {
            canvas,
            context: canvas.getContext('2d'),
        };
    }

    reset(canvasAndContext: any, width: number, height: number) {
        if (width <= 0 || height <= 0) {
            throw new Error('Invalid canvas size');
        }
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }

    destroy(canvasAndContext: any) {
        if (canvasAndContext.canvas) {
            canvasAndContext.canvas.width = 0;
            canvasAndContext.canvas.height = 0;
            canvasAndContext.canvas = null;
            canvasAndContext.context = null;
        }
    }
}

/**
 * Cloud Function to generate PDF thumbnails
 * Triggers when a PDF is uploaded to /papers/{userId}/{fileName}
 * Uses pdfjs-dist and canvas to render the first page as an image
 */
export const generateThumbnail = functions
    .runWith({
        memory: '1GB', // Increase memory for PDF rendering
        timeoutSeconds: 120 // Increase timeout for large PDFs
    })
    .storage
    .bucket('studyvault-4ec70.firebasestorage.app')
    .object()
    .onFinalize(async (object) => {
        const filePath = object.name;
        const contentType = object.contentType;

        // Only process PDF files in the papers folder
        if (!contentType?.includes('pdf') || !filePath?.startsWith('papers/')) {
            functions.logger.info('Not a PDF in papers folder, skipping');
            return null;
        }

        // Skip if this is already a thumbnail
        if (filePath.includes('thumbnails/')) {
            functions.logger.info('This is already a thumbnail, skipping');
            return null;
        }

        const bucket = admin.storage().bucket(object.bucket);
        const fileName = filePath.split('/').pop();
        const userId = filePath.split('/')[1];

        if (!fileName || !userId) {
            functions.logger.error('Could not parse file path:', filePath);
            return null;
        }

        functions.logger.info(`Generating thumbnail for: ${filePath}`);

        try {
            // Dynamically import pdfjs-dist (ESM module)
            // @ts-ignore
            const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

            // Download the PDF file
            const file = bucket.file(filePath);
            const [pdfBuffer] = await file.download();

            // Load PDF document
            // We convert Buffer to Uint8Array for pdfjs-dist
            const data = new Uint8Array(pdfBuffer);

            // Point to standard fonts in node_modules
            // In Cloud Functions, node_modules is at the root of the function directory
            const standardFontDataUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/');

            const loadingTask = pdfjsLib.getDocument({
                data,
                standardFontDataUrl,
                disableFontFace: true, // Disable font face to avoid font loading issues in Node
                canvasFactory: new NodeCanvasFactory(), // Use custom factory for Node environment
            } as any);

            const pdfDocument = await loadingTask.promise;

            if (pdfDocument.numPages === 0) {
                throw new Error('PDF has no pages');
            }

            // Get the first page
            const page = await pdfDocument.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            // Calculate scale to fit width of 300px
            const targetWidth = 300;
            const scale = targetWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });

            // Create canvas
            const canvasFactory = new NodeCanvasFactory();
            const { canvas, context } = canvasFactory.create(scaledViewport.width, scaledViewport.height);

            // Render PDF page to canvas
            await page.render({
                canvasContext: context as any,
                viewport: scaledViewport,
                canvasFactory: canvasFactory as any, // Pass factory to render method too
            } as any).promise;

            // Convert canvas to JPEG buffer
            // @ts-ignore
            const thumbnailBuffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });

            // Upload thumbnail to storage
            const thumbnailPath = `thumbnails/${userId}/${fileName.replace('.pdf', '.jpg')}`;
            const thumbnailFile = bucket.file(thumbnailPath);

            await thumbnailFile.save(thumbnailBuffer, {
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        originalFile: filePath,
                        generatedAt: new Date().toISOString(),
                    },
                },
            });

            // Make thumbnail publicly readable
            await thumbnailFile.makePublic();

            // Get thumbnail URL
            const thumbnailUrl = `https://storage.googleapis.com/${object.bucket}/${thumbnailPath}`;

            functions.logger.info(`Thumbnail generated: ${thumbnailUrl}`);

            // Update Firestore paper document with thumbnail URL
            const papersSnapshot = await admin.firestore()
                .collection('papers')
                .where('fileName', '==', fileName)
                .limit(10)
                .get();

            if (!papersSnapshot.empty) {
                // Filter in memory to find the right user's paper
                const matchingDocs = papersSnapshot.docs.filter(doc => doc.data().uploaderId === userId);

                if (matchingDocs.length > 0) {
                    // Sort by creation time to get the newest one if duplicates exist
                    matchingDocs.sort((a, b) => {
                        const aTime = a.data().createdAt?.toMillis() || 0;
                        const bTime = b.data().createdAt?.toMillis() || 0;
                        return bTime - aTime;
                    });

                    const paperDoc = matchingDocs[0];
                    await paperDoc.ref.update({
                        thumbnailUrl: thumbnailUrl,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    functions.logger.info(`Updated paper ${paperDoc.id} with thumbnail URL`);
                } else {
                    functions.logger.warn(`Could not find paper for user ${userId} with fileName ${fileName}`);
                }
            } else {
                functions.logger.warn(`Could not find paper document for ${fileName}`);
            }

            return { thumbnailUrl };
        } catch (error: any) {
            functions.logger.error('Error generating thumbnail:', error);
            return null;
        }
    });
