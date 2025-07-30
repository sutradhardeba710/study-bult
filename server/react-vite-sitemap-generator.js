const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Advanced Sitemap Generator for React Vite Applications
 * Handles static and dynamic routes, supports multiple formats
 */
class ReactViteSitemapGenerator {
  constructor(config = {}) {
    this.config = {
      baseUrl: 'https://study-vault2.vercel.app',
      outputPath: path.join(process.cwd(), 'public'),
      routesDir: path.join(process.cwd(), 'src'),
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
      excludePatterns: [
        '/api/*',
        '/admin/*',
        '/_*',
        '/test/*',
        '/dev/*'
      ],
      changefreq: 'weekly',
      priority: {
        '/': 1.0,
        '/browse': 0.9,
        '/upload': 0.8,
        default: 0.6
      },
      ...config
    };
  }

  /**
   * Generate sitemap from React Router configuration
   */
  async generateFromRoutes() {
    try {
      console.log('🔍 Scanning React routes...');
      
      // Find all route files
      const routeFiles = await glob(`${this.config.routesDir}/**/*Route*.{js,jsx,ts,tsx}`, {
        ignore: ['**/node_modules/**', '**/dist/**']
      });

      const dynamicRoutes = new Set();

      // Parse route files for dynamic routes
      for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Extract route paths using regex
        const routeMatches = content.match(/path\s*:\s*["'`]([^"'`]+)["'`]/g);
        
        if (routeMatches) {
          routeMatches.forEach(match => {
            const path = match.match(/["'`]([^"'`]+)["'`]/)[1];
            if (this.isValidRoute(path)) {
              dynamicRoutes.add(path);
            }
          });
        }
      }

      console.log(`📋 Found ${dynamicRoutes.size} dynamic routes`);
      return Array.from(dynamicRoutes);

    } catch (error) {
      console.error('❌ Failed to scan routes:', error.message);
      return [];
    }
  }

  /**
   * Check if route should be included in sitemap
   */
  isValidRoute(route) {
    // Skip dynamic parameters, wildcards, and excluded patterns
    if (route.includes(':') || route.includes('*') || route.includes('?')) {
      return false;
    }

    // Check against exclude patterns
    return !this.config.excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(route);
    });
  }

  /**
   * Fetch dynamic routes from API or database
   */
  async fetchDynamicRoutes() {
    try {
      console.log('🌐 Fetching dynamic routes...');
      
      // Example: Fetch from your API
      // const response = await fetch(`${this.config.baseUrl}/api/sitemap-routes`);
      // const routes = await response.json();
      
      // For now, return empty array - implement based on your data source
      const dynamicRoutes = [];
      
      // Example dynamic routes based on your app:
      // - Paper categories: /browse/category/engineering
      // - Individual papers: /paper/123
      // - User profiles: /user/username
      
      console.log(`📊 Found ${dynamicRoutes.length} dynamic routes from data source`);
      return dynamicRoutes;

    } catch (error) {
      console.error('❌ Failed to fetch dynamic routes:', error.message);
      return [];
    }
  }

  /**
   * Get priority for a specific route
   */
  getPriority(route) {
    return this.config.priority[route] || this.config.priority.default;
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
      const now = new Date().toISOString().split('T')[0];
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
      
      fs.writeFileSync(sitemapPath, xml);
      
      // Also create a generic sitemap.xml
      fs.writeFileSync(path.join(this.config.outputPath, 'sitemap.xml'), xml);

      console.log(`✅ Sitemap generated: ${sitemapPath}`);
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
      console.log('🤖 Generating robots.txt...');

      const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /dev/

# Sitemap location
Sitemap: ${this.config.baseUrl}/sitemap.xml

# Additional sitemap for better coverage
Sitemap: ${this.config.baseUrl}/sitemap-${new Date().toISOString().split('T')[0]}.xml`;

      const robotsPath = path.join(this.config.outputPath, 'robots.txt');
      fs.writeFileSync(robotsPath, robotsTxt);

      console.log(`✅ Robots.txt generated: ${robotsPath}`);
      return robotsPath;

    } catch (error) {
      console.error('❌ Failed to generate robots.txt:', error.message);
      throw error;
    }
  }

  /**
   * Generate sitemap index for large sites
   */
  async generateSitemapIndex(sitemaps) {
    try {
      console.log('📚 Generating sitemap index...');

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
      
      return {
        sitemap: sitemapPath,
        robots: path.join(this.config.outputPath, 'robots.txt'),
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
  const generator = new ReactViteSitemapGenerator({
    baseUrl: 'https://study-vault2.vercel.app',
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
    ]
  });

  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ReactViteSitemapGenerator; 