import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
    const logoPath = path.join(__dirname, 'public', 'logo.png');

    try {
        // Generate 192x192 icon
        await sharp(logoPath)
            .resize(192, 192, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFile(path.join(__dirname, 'public', 'pwa-192x192.png'));
        console.log('✓ Created pwa-192x192.png');

        // Generate 512x512 icon
        await sharp(logoPath)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFile(path.join(__dirname, 'public', 'pwa-512x512.png'));
        console.log('✓ Created pwa-512x512.png');

        console.log('\nPWA icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
