const fs = require('fs');
const path = require('path');

// Configuration for the sitemap generator
const config = {
  baseUrl: 'https://study-vault2.vercel.app',
  outputPath: path.join(__dirname, '../public'),
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
  changefreq: 'weekly',
  priority: 0.8
};

class ReactViteSitemapGenerator {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'https://study-vault2.vercel.app',
      outputPath: path.join(__dirname, '../public'),
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
      changefreq: 'weekly',
      priority: 0.8,
      ...config
    };
  }

  /**
   * Analyze React routes from source files
   */
  async generateFromRoutes() {
    // For now, return static routes since dynamic route analysis is complex
    return this.config.staticRoutes;
  }

  /**
   * Fetch dynamic routes from data sources (Firebase, API, etc.)
   */
  async fetchDynamicRoutes() {
    try {
      // Try to connect to Firebase Admin for dynamic routes
      let admin;
      try {
        admin = require('./firebaseAdmin');
      } catch (error) {
        console.warn('Firebase Admin not available for dynamic routes:', error.message);
        return [];
      }

      if (!admin || !admin.apps.length) {
        console.warn('Firebase Admin not initialized');
        return [];
      }

      const db = admin.firestore();
      const papersSnapshot = await db.collection('papers')
        .where('status', '==', 'approved')
        .limit(100)  // Limit for build-time generation
        .get();

      const routes = [];
      
      papersSnapshot.docs.forEach(doc => {
        routes.push(`/browse?paper=${doc.id}`);
      });

      console.log(`Found ${routes.length} dynamic routes from Firebase`);
      return routes;

    } catch (error) {
      console.error('Error fetching dynamic routes:', error.message);
      return [];
    }
  }

  /**
   * Get priority for a route
   */
  getPriority(route) {
    if (route === '/') return 1.0;
    if (route === '/browse') return 0.9;
    if (route === '/upload') return 0.8;
    if (route.includes('/browse?')) return 0.7;
    if (['/about', '/contact', '/faq', '/help-center'].includes(route)) return 0.6;
    return 0.5;
  }

  /**
   * Generate XML sitemap
   */
  async generateXMLSitemap() {
    try {
      console.log('🚀 Generating XML sitemap...');

      // Collect all routes
      const staticRoutes = this.config.staticRoutes;
      const dynamicRoutesFromCode = await this.generateFromRoutes();
      const dynamicRoutesFromData = await this.fetchDynamicRoutes();
      
      const allRoutes = [
        ...new Set([
          ...staticRoutes,
          ...dynamicRoutesFromCode,
          ...dynamicRoutesFromData
        ])
      ].sort();

      console.log(`📝 Generating sitemap with ${allRoutes.length} routes`);

      // Generate XML
      const now = new Date().toISOString();
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const route of allRoutes) {
        const url = `${this.config.baseUrl}${route}`;
        const priority = this.getPriority(route);
        
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${this.config.changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
      }

      xml += `
</urlset>`;

      // Write sitemap file
      const timestamp = new Date().toISOString().split('T')[0];
      const sitemapPath = path.join(this.config.outputPath, `sitemap-${timestamp}.xml`);
      
      // Ensure output directory exists
      if (!fs.existsSync(this.config.outputPath)) {
        fs.mkdirSync(this.config.outputPath, { recursive: true });
      }
      
      fs.writeFileSync(sitemapPath, xml);
      
      // Also create a generic sitemap.xml - but this will be served dynamically by the backend
      // This is just for fallback during build
      fs.writeFileSync(path.join(this.config.outputPath, 'sitemap-static.xml'), xml);

      console.log(`✅ Static sitemap generated: ${sitemapPath}`);
      console.log('Note: Dynamic sitemap will be served by the backend at /sitemap.xml');
      return sitemapPath;

    } catch (error) {
      console.error('❌ Failed to generate sitemap:', error.message);
      throw error;
    }
  }

  /**
   * Generate robots.txt
   */
  generateRobotsTxt() {
    try {
      console.log('🚀 Generating robots.txt...');
      
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

# Sitemap location (served dynamically)
Sitemap: ${this.config.baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;

      const robotsPath = path.join(this.config.outputPath, 'robots-static.txt');
      fs.writeFileSync(robotsPath, robotsTxt);
      
      console.log(`✅ Static robots.txt generated: ${robotsPath}`);
      console.log('Note: Dynamic robots.txt will be served by the backend at /robots.txt');
      
      return robotsPath;
    } catch (error) {
      console.error('❌ Failed to generate robots.txt:', error.message);
      throw error;
    }
  }

  /**
   * Generate sitemap index for multiple sitemaps
   */
  async generateSitemapIndex(sitemaps) {
    try {
      console.log('🚀 Generating sitemap index...');
      
      const now = new Date().toISOString();
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const sitemap of sitemaps) {
        xml += `
  <sitemap>
    <loc>${this.config.baseUrl}/${sitemap}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
      }

      xml += `
</sitemapindex>`;

      const indexPath = path.join(this.config.outputPath, 'sitemap-index.xml');
      fs.writeFileSync(indexPath, xml);
      
      console.log(`✅ Sitemap index generated: ${indexPath}`);
      return indexPath;

    } catch (error) {
      console.error('❌ Failed to generate sitemap index:', error.message);
      throw error;
    }
  }

  /**
   * Full generation process
   */
  async generate() {
    try {
      console.log('🎯 Starting sitemap generation process...');

      // Ensure output directory exists
      if (!fs.existsSync(this.config.outputPath)) {
        fs.mkdirSync(this.config.outputPath, { recursive: true });
      }

      // Generate main sitemap
      const sitemapPath = await this.generateXMLSitemap();
      
      // Generate robots.txt
      this.generateRobotsTxt();

      // Generate sitemap index if needed (for large sites)
      const sitemapFiles = [
        path.basename(sitemapPath)
      ];
      
      if (sitemapFiles.length > 1) {
        await this.generateSitemapIndex(sitemapFiles);
      }

      console.log('✅ Sitemap generation completed successfully!');
      console.log('Note: The backend will serve dynamic sitemaps at runtime');
      
      return {
        sitemap: sitemapPath,
        robots: path.join(this.config.outputPath, 'robots-static.txt'),
        routes: await this.generateFromRoutes()
      };

    } catch (error) {
      console.error('❌ Sitemap generation failed:', error.message);
      throw error;
    }
  }
}

/**
 * CLI Usage
 */
async function main() {
  const generator = new ReactViteSitemapGenerator(config);
  
  try {
    await generator.generate();
    process.exit(0);
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ReactViteSitemapGenerator; 