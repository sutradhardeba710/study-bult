import { getPapers } from './papers';
import type { PaperData } from './upload';
import { seoUtils } from './seo';

export interface SitemapUrl {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: Date | string;
}

// Generate XML sitemap content
export const generateXMLSitemap = (urls: SitemapUrl[]): string => {
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.lastmod ? `<lastmod>${formatDate(url.lastmod)}</lastmod>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlElements}
</urlset>`;
};

// Generate sitemap index for multiple sitemaps
export const generateSitemapIndex = (sitemaps: Array<{ url: string; lastmod?: Date }>): string => {
  const sitemapElements = sitemaps.map(sitemap => `
  <sitemap>
    <loc>${sitemap.url}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod.toISOString().split('T')[0]}</lastmod>` : ''}
  </sitemap>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapElements}
</sitemapindex>`;
};

// Generate main sitemap with all URLs
export const generateMainSitemap = async (): Promise<string> => {
  try {
    // Get all approved papers
    const papers = await getPapers({ status: 'approved' }, 10000);
    
    // Generate sitemap URLs
    const urls = seoUtils.generateSitemapUrls(papers);
    
    return generateXMLSitemap(urls);
  } catch (error) {
    console.error('Error generating main sitemap:', error);
    throw error;
  }
};

// Generate papers-only sitemap (for large sites)
export const generatePapersSitemap = async (): Promise<string> => {
  try {
    const papers = await getPapers({ status: 'approved' }, 10000);
    const baseUrl = 'https://study-vault-gamma.vercel.app';
    
    const paperUrls: SitemapUrl[] = papers.map(paper => ({
      url: `${baseUrl}/paper/${paper.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: paper.updatedAt || paper.createdAt
    }));

    return generateXMLSitemap(paperUrls);
  } catch (error) {
    console.error('Error generating papers sitemap:', error);
    throw error;
  }
};

// Generate pages-only sitemap
export const generatePagesSitemap = (): string => {
  const baseUrl = 'https://study-vault-gamma.vercel.app';
  
  const pageUrls: SitemapUrl[] = [
    { url: baseUrl, changefreq: 'daily', priority: 1.0 },
    { url: `${baseUrl}/browse`, changefreq: 'daily', priority: 0.9 },
    { url: `${baseUrl}/upload`, changefreq: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, changefreq: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/help-center`, changefreq: 'monthly', priority: 0.5 },
  ];

  return generateXMLSitemap(pageUrls);
};

// Generate category-based sitemaps
export const generateCategorySitemaps = async (): Promise<Record<string, string>> => {
  try {
    const papers = await getPapers({ status: 'approved' }, 10000);
    const baseUrl = 'https://study-vault-gamma.vercel.app';
    
    const categories: Record<string, PaperData[]> = {};
    
    // Group papers by course
    papers.forEach(paper => {
      const category = paper.course || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(paper);
    });

    const sitemaps: Record<string, string> = {};

    // Generate sitemap for each category
    Object.entries(categories).forEach(([category, categoryPapers]) => {
      const categoryUrls: SitemapUrl[] = [
        // Category browse page
        {
          url: `${baseUrl}/browse?course=${encodeURIComponent(category)}`,
          changefreq: 'daily',
          priority: 0.8
        },
        // Papers in this category
        ...categoryPapers.map(paper => ({
          url: `${baseUrl}/paper/${paper.id}`,
          changefreq: 'weekly' as const,
          priority: 0.7,
          lastmod: paper.updatedAt || paper.createdAt
        }))
      ];

      sitemaps[category] = generateXMLSitemap(categoryUrls);
    });

    return sitemaps;
  } catch (error) {
    console.error('Error generating category sitemaps:', error);
    return {};
  }
};

// Save sitemap to public directory (for build process)
export const saveSitemapToFile = (content: string, filename: string = 'sitemap.xml'): void => {
  // This would typically be done during build process
  // For client-side, we can't write files directly
  console.log(`Sitemap generated for ${filename}:`, content.length, 'characters');
  
  // In a Node.js environment, you would use:
  // import { writeFileSync } from 'fs';
  // import { join } from 'path';
  // writeFileSync(join(process.cwd(), 'public', filename), content);
};

// Generate robots.txt with sitemap references
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://study-vault-gamma.vercel.app';
  
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
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-papers.xml
Sitemap: ${baseUrl}/sitemap-pages.xml

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
};

// Auto-generate and submit sitemaps
export const autoGenerateAndSubmitSitemaps = async (): Promise<void> => {
  try {
    console.log('Starting sitemap generation...');
    
    // Generate all sitemaps
    const mainSitemap = await generateMainSitemap();
    const papersSitemap = await generatePapersSitemap();
    const pagesSitemap = generatePagesSitemap();
    const categorySitemaps = await generateCategorySitemaps();
    
    // Save sitemaps (in production, these would be saved to files)
    saveSitemapToFile(mainSitemap, 'sitemap.xml');
    saveSitemapToFile(papersSitemap, 'sitemap-papers.xml');
    saveSitemapToFile(pagesSitemap, 'sitemap-pages.xml');
    
    // Save category sitemaps
    Object.entries(categorySitemaps).forEach(([category, content]) => {
      saveSitemapToFile(content, `sitemap-${category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.xml`);
    });
    
    // Generate and save robots.txt
    const robotsTxt = generateRobotsTxt();
    saveSitemapToFile(robotsTxt, 'robots.txt');
    
    // Generate sitemap index
    const sitemapIndex = generateSitemapIndex([
      { url: 'https://study-vault-gamma.vercel.app/sitemap.xml' },
      { url: 'https://study-vault-gamma.vercel.app/sitemap-papers.xml' },
      { url: 'https://study-vault-gamma.vercel.app/sitemap-pages.xml' },
      ...Object.keys(categorySitemaps).map(category => ({
        url: `https://study-vault-gamma.vercel.app/sitemap-${category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.xml`
      }))
    ]);
    
    saveSitemapToFile(sitemapIndex, 'sitemap-index.xml');
    
    console.log('Sitemap generation completed successfully');
  } catch (error) {
    console.error('Error in auto-generating sitemaps:', error);
  }
};

// Utility to check if URL should be included in sitemap
export const shouldIncludeInSitemap = (url: string): boolean => {
  const excludePatterns = [
    '/dashboard',
    '/admin',
    '/api',
    '/login',
    '/register',
    '/reset-password'
  ];
  
  return !excludePatterns.some(pattern => url.includes(pattern));
};

// Generate news sitemap for recent papers (Google News)
export const generateNewsSitemap = async (days: number = 2): Promise<string> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const papers = await getPapers({ status: 'approved' }, 1000);
    const recentPapers = papers.filter(paper => {
      const paperDate = paper.createdAt?.toDate ? paper.createdAt.toDate() : new Date(paper.createdAt);
      return paperDate > cutoffDate;
    });

    const baseUrl = 'https://study-vault-gamma.vercel.app';
    
    const newsElements = recentPapers.map(paper => {
      const paperDate = paper.createdAt?.toDate ? paper.createdAt.toDate() : new Date(paper.createdAt);
      
      return `
  <url>
    <loc>${baseUrl}/paper/${paper.id}</loc>
    <news:news>
      <news:publication>
        <news:name>StudyVault</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${paperDate.toISOString()}</news:publication_date>
      <news:title>${paper.title}</news:title>
      <news:keywords>${paper.subject}, ${paper.course}, question paper</news:keywords>
    </news:news>
  </url>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsElements}
</urlset>`;
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return '';
  }
}; 