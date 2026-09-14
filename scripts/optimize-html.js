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
  let changed = false;

  // 1. Remove all modulepreload tags from <head> to prevent mobile 4G bandwidth saturation
  const modulePreloadPattern = /<link rel="modulepreload"[^>]*>\s*/g;
  if (modulePreloadPattern.test(content)) {
    content = content.replace(modulePreloadPattern, '');
    changed = true;
  }

  // 2. Find and extract the main CSS stylesheet
  const cssMatch = content.match(/<link rel="stylesheet"(?: crossorigin="")? href="(\/assets\/[^"]+\.css)">/);
  const existingPreloadCssMatch = content.match(/<link rel="preload" as="style" href="(\/assets\/[^"]+\.css)">/);
  const cssHref = cssMatch ? cssMatch[1] : (existingPreloadCssMatch ? existingPreloadCssMatch[1] : null);

  if (cssHref) {
    // Remove existing CSS and preload link tags from wherever they were
    content = content.replace(/<link rel="preload" as="style" href="\/assets\/[^"]+\.css">\s*/g, '');
    content = content.replace(/<link rel="stylesheet"(?: crossorigin="")? href="\/assets\/[^"]+\.css">\s*/g, '');

    const optimizedCssTag = `<link rel="preload" as="style" href="${cssHref}"><link rel="stylesheet" href="${cssHref}">\n`;
    
    // Insert CSS immediately after inline <style>...</style> so it is discovered at the very top of <head>
    if (content.includes('</style>')) {
      content = content.replace('</style>', `</style>\n  ${optimizedCssTag}`);
    } else if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n  ${optimizedCssTag}`);
    }
    changed = true;
  }

  // 3. Find and extract the entry script (e.g. app-*.js or main-*.js)
  // Remove any async="" or defer="" attributes and relocate it to the end of <body>
  const entryScriptPattern = /<script type="module"(?: (?:async|defer)(?:="[^"]*")?)?(?: crossorigin(?:="[^"]*")?)? src="(\/assets\/(?:app|main)[^"]*\.js)"><\/script>\s*/g;
  const scriptMatch = content.match(entryScriptPattern);

  if (scriptMatch && scriptMatch.length > 0) {
    const srcMatch = scriptMatch[0].match(/src="([^"]+)"/);
    if (srcMatch) {
      const scriptSrc = srcMatch[1];
      // Remove script from <head>
      content = content.replace(entryScriptPattern, '');

      // Place script right before </body>
      const bottomScript = `<script type="module" crossorigin="" src="${scriptSrc}"></script>\n</body>`;
      content = content.replace('</body>', bottomScript);
      changed = true;
    }
  }

  if (changed) {
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

console.log(`[optimize-html] Successfully optimized ${optimizedCount} HTML files: CSS elevated to top of head, modulepreloads stripped, entry script placed at bottom of body.`);
