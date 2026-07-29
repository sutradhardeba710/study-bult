import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// We use the newly extracted tight icon (book only)
const iconLogoPath = path.join(publicDir, 'logo-icon-only.png');

if (!fs.existsSync(iconLogoPath)) {
    console.error(`❌ Source icon not found at ${iconLogoPath}`);
    process.exit(1);
}

const generatePaddedIcon = async (filename, size, paddingPercent, options = {}) => {
    const outputPath = path.join(publicDir, filename);

    try {
        const innerSize = Math.floor(size * (1 - (paddingPercent * 2)));

        const resizedLogoBuffer = await sharp(iconLogoPath)
            .resize({
                width: innerSize,
                height: innerSize,
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toBuffer();

        const background = options.transparent
            ? { r: 255, g: 255, b: 255, alpha: 0 }
            : { r: 255, g: 255, b: 255, alpha: 1 };

        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background
            }
        })
            .composite([{ input: resizedLogoBuffer, gravity: 'center' }])
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated padded ${filename} (${size}x${size}) [Transparent: ${!!options.transparent}]`);
    } catch (error) {
        console.error(`❌ Failed to generate ${filename}:`, error);
    }
};

const run = async () => {
    console.log('🖼️ Starting generation of Icon-Only brand assets...');

    // Transparent logo for internal website use (Navbar, Footer) - filling the space completely (0 padding)
    await generatePaddedIcon('logo.png', 512, 0, { transparent: true });

    // Core web favicons (standard sizing) with a solid white background 
    // We use a tiny padding (2%) so the icon appears HUGE like Facebook or Google
    await generatePaddedIcon('favicon.png', 32, 0.02);

    // Apple touch icons and PWAs usually need a tiny bit more breathing room (5%)
    await generatePaddedIcon('apple-touch-icon.png', 180, 0.05);
    await generatePaddedIcon('pwa-192x192.png', 192, 0.05);
    await generatePaddedIcon('pwa-512x512.png', 512, 0.05);

    console.log('✨ Icon-only assets rebuilt!');
};

run();
