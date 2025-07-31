const express = require('express');
const router = express.Router();
const path = require('path'); // Added missing import for path

// Import Firebase Admin initialization
let admin;
try {
  admin = require('../firebaseAdmin');
} catch (error) {
  console.warn('Firebase Admin SDK not available for server-side sitemap generation:', error.message);
}

// Import sitemap generator
const ReactViteSitemapGenerator = require('../react-vite-sitemap-generator');

const BASE_URL = process.env.VITE_SITE_URL || 'https://study-vault2.vercel.app';

// Generate sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    res.set('Content-Type', 'application/xml');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Static pages
    const staticPages = [
      { url: '', priority: 1.0, changefreq: 'daily' },
      { url: '/browse', priority: 0.9, changefreq: 'hourly' },
      { url: '/upload', priority: 0.8, changefreq: 'weekly' },
      { url: '/about', priority: 0.7, changefreq: 'monthly' },
      { url: '/contact', priority: 0.6, changefreq: 'monthly' },
      { url: '/faq', priority: 0.6, changefreq: 'monthly' },
      { url: '/help-center', priority: 0.6, changefreq: 'monthly' },
      { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
      { url: '/terms', priority: 0.5, changefreq: 'yearly' },
      { url: '/cookie-policy', priority: 0.5, changefreq: 'yearly' }
    ];

    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Dynamic content from Firebase (if available)
    if (admin && admin.apps.length > 0) {
      try {
        const db = admin.firestore();
        const papersSnapshot = await db.collection('papers')
          .where('status', '==', 'approved')
          .orderBy('createdAt', 'desc')
          .limit(1000)
          .get();

        const papers = papersSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));

        // Add individual paper pages
        papers.forEach(paper => {
          if (paper.id) {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/browse?paper=${paper.id}</loc>\n`;
            xml += `    <lastmod>${paper.createdAt ? new Date(paper.createdAt.toDate()).toISOString() : new Date().toISOString()}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
          }
        });

        // Add category pages
        const subjects = [...new Set(papers.map(p => p.subject).filter(Boolean))];
        const courses = [...new Set(papers.map(p => p.course).filter(Boolean))];
        const colleges = [...new Set(papers.map(p => p.college).filter(Boolean))];

        subjects.forEach(subject => {
          xml += '  <url>\n';
          xml += `    <loc>${BASE_URL}/browse?subject=${encodeURIComponent(subject)}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
          xml += '    <changefreq>daily</changefreq>\n';
          xml += '    <priority>0.7</priority>\n';
          xml += '  </url>\n';
        });

        courses.forEach(course => {
          xml += '  <url>\n';
          xml += `    <loc>${BASE_URL}/browse?course=${encodeURIComponent(course)}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
          xml += '    <changefreq>daily</changefreq>\n';
          xml += '    <priority>0.7</priority>\n';
          xml += '  </url>\n';
        });

        colleges.forEach(college => {
          xml += '  <url>\n';
          xml += `    <loc>${BASE_URL}/browse?college=${encodeURIComponent(college)}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
          xml += '    <changefreq>weekly</changefreq>\n';
          xml += '    <priority>0.6</priority>\n';
          xml += '  </url>\n';
        });

      } catch (error) {
        console.error('Error fetching dynamic content for sitemap:', error);
      }
    }
    
    xml += '</urlset>';
    
    // Cache for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate robots.txt
router.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  
  const robotsTxt = `# StudyVault robots.txt
User-agent: *
Allow: /

# Important: Allow crawling of main content
Allow: /browse
Allow: /about
Allow: /contact
Allow: /faq
Allow: /help-center

# Disallow private/sensitive areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /login
Disallow: /register
Disallow: /reset-password

# Disallow search parameter variations to prevent duplicate content
Disallow: /browse?*sort=*
Disallow: /browse?*page=*

# Allow common crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;

  // Cache for 24 hours
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(robotsTxt);
});

// API route to generate a new sitemap
router.post('/api/generate-sitemap', async (req, res) => {
  try {
    console.log('📊 Starting sitemap generation process...');
    
    // Initialize sitemap generator with custom config
    const generator = new ReactViteSitemapGenerator({
      baseUrl: BASE_URL,
      outputPath: path.resolve(__dirname, '../../public'),
      staticRoutes: [
        '/',
        '/browse',
        '/upload',
        '/about',
        '/contact',
        '/faq',
        '/help-center',
        '/privacy',
        '/terms',
        '/cookie-policy'
      ],
      changefreq: 'weekly'
    });
    
    // Generate sitemap
    const result = await generator.generate();
    
    // Return success response
    res.json({
      success: true,
      message: 'Sitemap generated successfully',
      path: `${BASE_URL}/sitemap.xml`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sitemap',
      error: error.message
    });
  }
});

module.exports = router; 