const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.SITE_URL || 'https://studyvault.example.com';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Define your routes here
const routes = [
  {
    path: '/',
    changefreq: 'weekly',
    priority: 1.0
  },
  {
    path: '/about',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    path: '/browse',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    path: '/contact',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    path: '/login',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    path: '/register',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    path: '/privacy',
    changefreq: 'yearly',
    priority: 0.5
  },
  {
    path: '/terms',
    changefreq: 'yearly',
    priority: 0.5
  }
];

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Generate sitemap XML
function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  return sitemap;
}

// Write sitemap to file
try {
  const sitemap = generateSitemap();
  fs.writeFileSync(OUTPUT_PATH, sitemap);
  console.log(`Sitemap generated successfully at ${OUTPUT_PATH}`);
} catch (error) {
  console.error('Error generating sitemap:', error);
  process.exit(1);
} 