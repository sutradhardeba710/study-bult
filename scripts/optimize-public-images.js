import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

const images = [
    { input: 'favicon.png', output: 'favicon.png' },
    { input: 'apple-touch-icon.png', output: 'apple-touch-icon.png' },
    { input: 'logo.png', output: 'logo.png' }
];

async function optimizeImages() {
    console.log('Starting image optimization...\n');

    for (const img of images) {
        const inputPath = path.join(publicDir, img.input);
        const outputPath = path.join(publicDir, img.output);
        const backupPath = path.join(publicDir, img.output.replace('.png', '.original.png'));
        const webpPath = path.join(publicDir, img.output.replace('.png', '.webp'));

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  ${img.input} not found, skipping...`);
            continue;
        }

        try {
            // Get original size
            const originalStats = fs.statSync(inputPath);
            const originalSizeKB = (originalStats.size / 1024).toFixed(2);

            // Create backup if it doesn't exist
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(inputPath, backupPath);
                console.log(`📦 Created backup: ${img.output.replace('.png', '.original.png')}`);
            }

            // Optimize PNG with high compression
            const pngBuffer = await sharp(inputPath)
                .png({
                    quality: 85,
                    compressionLevel: 9,
                    effort: 10,
                    palette: true // Use palette for smaller file size
                })
                .toBuffer();

            const optimizedSizeKB = (pngBuffer.length / 1024).toFixed(2);

            if (parseFloat(optimizedSizeKB) < parseFloat(originalSizeKB)) {
                fs.writeFileSync(outputPath, pngBuffer);
                console.log(`✅ ${img.input}:`);
                console.log(`   Original: ${originalSizeKB} KB`);
                console.log(`   Optimized: ${optimizedSizeKB} KB`);
                console.log(`   Savings: ${((1 - optimizedSizeKB / originalSizeKB) * 100).toFixed(1)}%`);
            } else {
                console.log(`ℹ️  ${img.input}: Already optimized (${originalSizeKB} KB)`);
            }

            // Create WebP version for modern browsers
            await sharp(inputPath)
                .webp({ quality: 85, effort: 6 })
                .toFile(webpPath);

            const webpStats = fs.statSync(webpPath);
            const webpSizeKB = (webpStats.size / 1024).toFixed(2);
            console.log(`   WebP version: ${webpSizeKB} KB (${((webpSizeKB / originalSizeKB) * 100).toFixed(1)}% of original)\n`);

        } catch (error) {
            console.error(`❌ Error optimizing ${img.input}:`, error.message);
        }
    }

    console.log('✨ Image optimization complete!');
}

optimizeImages().catch(console.error);
