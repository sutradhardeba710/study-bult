import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// We use the tight icon from the previous step
const iconLogoPath = path.join(publicDir, 'logo-icon-only.png');

if (!fs.existsSync(iconLogoPath)) {
    console.error(`❌ Source icon not found at ${iconLogoPath}`);
    process.exit(1);
}

const generateMaximizedIcon = async (filename, size, paddingPercent, options = {}) => {
    const outputPath = path.join(publicDir, filename);

    try {
        const innerSize = Math.floor(size * (1 - (paddingPercent * 2)));

        // Trim ALL transparent pixels from the source first to get the true bounding box
        const trimmedBuffer = await sharp(iconLogoPath)
            .trim()
            .toBuffer();

        if (options.naturalRatio) {
            // Do NOT force into a square canvas. Keep the native shape.
            await sharp(trimmedBuffer)
                .resize({
                    height: size, // scale by height
                    fit: 'inside'
                })
                .png()
                .toFile(outputPath);
            console.log(`✅ Generated natural ratio ${filename} (height: ${size})`);
            return;
        }

        // Resize the perfectly tight bounding box to our target inner size
        const resizedLogoBuffer = await sharp(trimmedBuffer)
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

        console.log(`✅ Generated maximized ${filename} (${size}x${size}) [Padding: ${paddingPercent * 100}%]`);
    } catch (error) {
        console.error(`❌ Failed to generate ${filename}:`, error);
    }
};

const run = async () => {
    console.log('🖼️ Starting aggressive generation of MAXIMUM SIZE brand assets...');

    // Transparent logo for internal website use: keep the natural dimension so "h-10 w-auto" scales beautifully
    await generateMaximizedIcon('logo.png', 256, 0, { naturalRatio: true });

    // Favicon (32x32) with 0% padding on a white background so the blue touches the absolute edges
    await generateMaximizedIcon('favicon.png', 32, 0);

    // Apple touch icons and PWAs usually need a tiny bit of breathing room (2%) so iOS doesn't clip the corners
    await generateMaximizedIcon('apple-touch-icon.png', 180, 0.02);
    // Android PWA icons should be TRANSPARENT so Chrome can wrap them in adaptive icons
    await generateMaximizedIcon('pwa-192x192.png', 192, 0.02, { transparent: true });
    await generateMaximizedIcon('pwa-512x512.png', 512, 0.02, { transparent: true });

    console.log('✨ Maximum visibility assets rebuilt!');
};

run();
