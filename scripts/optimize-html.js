import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const distDir = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(distDir)) {
  console.log('[optimize-html] dist directory does not exist, skipping.');
  process.exit(0);
}

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`[optimize-html] Found ${htmlFiles.length} HTML files to optimize.`);

let optimizedCount = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add preload hint while keeping stylesheet to prevent layout thrashing
  const cssPattern = /<link rel="stylesheet"(?: crossorigin="")? href="(\/assets\/[^"]+\.css)">/g;

  if (cssPattern.test(content)) {
    content = content.replace(
      cssPattern,
      '<link rel="preload" as="style" href="$1"><link rel="stylesheet" href="$1">'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    optimizedCount++;

    // Re-compress .gz and .br if they exist
    const gzPath = filePath + '.gz';
    if (fs.existsSync(gzPath)) {
      const gzipped = zlib.gzipSync(content, { level: 9 });
      fs.writeFileSync(gzPath, gzipped);
    }

    const brPath = filePath + '.br';
    if (fs.existsSync(brPath)) {
      const brotlied = zlib.brotliCompressSync(content, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      });
      fs.writeFileSync(brPath, brotlied);
    }
  }
}

console.log(`[optimize-html] Successfully optimized ${optimizedCount} HTML files for non-blocking CSS.`);
