import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const originalLogoPath = path.join(publicDir, 'logo.original.png');
const tempTrimPath = path.join(publicDir, 'temp-trim.png');
const iconOnlyPath = path.join(publicDir, 'logo-icon-only.png');

async function extractIcon() {
    console.log('Trimming transparent space...');
    const trimmed = await sharp(originalLogoPath).trim().toFile(tempTrimPath);
    console.log('Trimmed size:', trimmed.width, 'x', trimmed.height);

    // Assuming the text is at the bottom, taking roughly the bottom 25-30%.
    // We'll extract the top 75% then trim again.
    const topHeight = Math.floor(trimmed.height * 0.75);
    console.log('Extracting top', topHeight, 'pixels...');

    await sharp(tempTrimPath)
        .extract({ left: 0, top: 0, width: trimmed.width, height: topHeight })
        .trim() // trim again to get a tight bounding box around the book!
        .toFile(iconOnlyPath);

    console.log('Created tight icon-only PNG:', iconOnlyPath);

    // cleanup
    fs.unlinkSync(tempTrimPath);
}

extractIcon().catch(console.error);
