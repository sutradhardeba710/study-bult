import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to process
const PUBLIC_DIR = path.join(__dirname, '../public');
const SRC_ASSETS_DIR = path.join(__dirname, '../src/assets');

// Output directories
const PUBLIC_OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');
const SRC_OPTIMIZED_DIR = path.join(SRC_ASSETS_DIR, 'optimized');

// Create output directories if they don't exist
if (!fs.existsSync(PUBLIC_OPTIMIZED_DIR)) {
  fs.mkdirSync(PUBLIC_OPTIMIZED_DIR, { recursive: true });
}

if (!fs.existsSync(SRC_OPTIMIZED_DIR)) {
  fs.mkdirSync(SRC_OPTIMIZED_DIR, { recursive: true });
}

// Supported image formats
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Process images in a directory
async function processDirectory(directory, outputDir) {
  try {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Create corresponding directory in output
        const nestedOutputDir = path.join(outputDir, file);
        if (!fs.existsSync(nestedOutputDir)) {
          fs.mkdirSync(nestedOutputDir, { recursive: true });
        }
        // Process nested directory
        await processDirectory(filePath, nestedOutputDir);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          await optimizeImage(filePath, path.join(outputDir, file));
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Optimize a single image
async function optimizeImage(inputPath, outputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const image = sharp(inputPath);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Skip if already optimized
    const stats = fs.statSync(inputPath);
    if (stats.size < 10000) {
      // If image is already small, just copy it
      fs.copyFileSync(inputPath, outputPath);
      console.log(`Copied small image: ${inputPath} -> ${outputPath}`);
      return;
    }
    
    // Resize large images
    if (metadata.width > 1200) {
      image.resize(1200);
    }
    
    // Apply format-specific optimizations
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outputPath);
    } else if (ext === '.png') {
      await image
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(outputPath);
    } else if (ext === '.webp') {
      await image
        .webp({ quality: 80 })
        .toFile(outputPath);
    } else if (ext === '.gif') {
      // For GIFs, just copy the file as sharp doesn't handle animated GIFs well
      fs.copyFileSync(inputPath, outputPath);
    }
    
    console.log(`Optimized: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing image ${inputPath}:`, error);
    // If optimization fails, copy the original
    fs.copyFileSync(inputPath, outputPath);
  }
}

// Main function
async function main() {
  console.log('Starting image optimization...');
  
  // Process public directory
  await processDirectory(PUBLIC_DIR, PUBLIC_OPTIMIZED_DIR);
  
  // Process src/assets directory
  await processDirectory(SRC_ASSETS_DIR, SRC_OPTIMIZED_DIR);
  
  console.log('Image optimization complete!');
}

main().catch(console.error); 