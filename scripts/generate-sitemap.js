#!/usr/bin/env node

/**
 * Build-time sitemap generation script for StudyVault
 * This script generates XML sitemaps during the build process
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base configuration
const BASE_URL = 'https://study-vault-gamma.vercel.app';
const OUTPUT_DIR = join(__dirname, '../dist');

// Ensure output directory exists
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (error) {
  // Directory already exists
}

// Static pages configuration
const STATIC_PAGES = [
  { url: '', priority: 1.0, changefreq: 'daily' },
  { url: '/browse', priority: 0.9, changefreq: 'daily' },
  { url: '/upload', priority: 0.7, changefreq: 'weekly' },
  { url: '/about', priority: 0.6, changefreq: 'monthly' },
  { url: '/contact', priority: 0.5, changefreq: 'monthly' },
  { url: '/faq', priority: 0.5, changefreq: 'monthly' },
  { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  { url: '/cookie-policy', priority: 0.3, changefreq: 'yearly' },
  { url: '/help-center', priority: 0.5, changefreq: 'monthly' },
];

// Generate XML sitemap
function generateXMLSitemap(urls) {
  const urlElements = urls.map(url => `
  <url>
    <loc>${BASE_URL}${url.url}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlElements}
</urlset>`;
}

// Generate robots.txt
function generateRobotsTxt() {
  return `# StudyVault robots.txt
User-agent: *
Allow: /

# Disallow private areas
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/

# Disallow URL parameters that don't add value
Disallow: /*?*
Allow: /browse?*
Allow: /search?*

# Sitemap locations
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-papers.xml
Sitemap: ${BASE_URL}/sitemap-pages.xml

# Crawl delay for politeness
Crawl-delay: 1

# Special rules for different bots
User-agent: Googlebot
Crawl-delay: 0

User-agent: Bingbot
Crawl-delay: 2

# Block bad bots
User-agent: BadBot
Disallow: /

User-agent: Scraperbot
Disallow: /`;
}

// Generate sitemap index
function generateSitemapIndex(sitemaps) {
  const sitemapElements = sitemaps.map(sitemap => `
  <sitemap>
    <loc>${sitemap.url}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapElements}
</sitemapindex>`;
}

// Generate meta tags template
function generateMetaTemplate() {
  return `<!-- Google Search Console Verification -->
<meta name="google-site-verification" content="REPLACE_WITH_YOUR_VERIFICATION_CODE" />

<!-- SEO Meta Tags -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="author" content="StudyVault" />
<meta name="generator" content="StudyVault" />

<!-- Open Graph Meta Tags -->
<meta property="og:locale" content="en_US" />
<meta property="og:site_name" content="StudyVault" />

<!-- Twitter Meta Tags -->
<meta name="twitter:site" content="@studyvault" />
<meta name="twitter:creator" content="@studyvault" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />

<!-- Preconnect to external domains for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://firebasestorage.googleapis.com" crossorigin />
<link rel="preconnect" href="https://www.google-analytics.com" crossorigin />

<!-- DNS Prefetch for better performance -->
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
<link rel="dns-prefetch" href="//www.google-analytics.com" />`;
}

// Main function
async function generateSitemaps() {
  try {
    console.log('🚀 Starting sitemap generation...');

    // Generate static pages sitemap
    const staticSitemap = generateXMLSitemap(STATIC_PAGES);
    writeFileSync(join(OUTPUT_DIR, 'sitemap-pages.xml'), staticSitemap);
    console.log('✅ Generated sitemap-pages.xml');

    // Generate main sitemap (for now, just static pages)
    writeFileSync(join(OUTPUT_DIR, 'sitemap.xml'), staticSitemap);
    console.log('✅ Generated sitemap.xml');

    // Generate robots.txt
    const robotsTxt = generateRobotsTxt();
    writeFileSync(join(OUTPUT_DIR, 'robots.txt'), robotsTxt);
    console.log('✅ Generated robots.txt');

    // Generate sitemap index
    const sitemapIndex = generateSitemapIndex([
      { url: `${BASE_URL}/sitemap.xml` },
      { url: `${BASE_URL}/sitemap-pages.xml` },
    ]);
    writeFileSync(join(OUTPUT_DIR, 'sitemap-index.xml'), sitemapIndex);
    console.log('✅ Generated sitemap-index.xml');

    // Generate meta template for reference
    const metaTemplate = generateMetaTemplate();
    writeFileSync(join(OUTPUT_DIR, 'meta-template.html'), metaTemplate);
    console.log('✅ Generated meta-template.html');

    console.log('🎉 Sitemap generation completed successfully!');
    console.log(`📁 Files generated in: ${OUTPUT_DIR}`);
    
    // List generated files
    console.log('\n📄 Generated files:');
    console.log('  - sitemap.xml');
    console.log('  - sitemap-pages.xml');
    console.log('  - sitemap-index.xml');
    console.log('  - robots.txt');
    console.log('  - meta-template.html');

  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemaps();
}

export { generateSitemaps }; 