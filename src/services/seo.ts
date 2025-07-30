// SEO and Search Console Integration Service
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import type { PaperData } from './upload';

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface SearchConsoleConfig {
  siteUrl: string;
  verificationCode: string;
  indexingApiKey?: string;
}

const BASE_URL = import.meta.env.VITE_SITE_URL || 'https://study-vault-gamma.vercel.app';

// Generate sitemap entries for all public pages
export const generateSitemap = async (): Promise<SitemapEntry[]> => {
  const entries: SitemapEntry[] = [];

  // Static pages with high priority
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' as const },
    { url: '/browse', priority: 0.9, changefreq: 'hourly' as const },
    { url: '/upload', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/about', priority: 0.7, changefreq: 'monthly' as const },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/faq', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/help-center', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
    { url: '/terms', priority: 0.5, changefreq: 'yearly' as const },
    { url: '/cookie-policy', priority: 0.5, changefreq: 'yearly' as const }
  ];

  staticPages.forEach(page => {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastmod: new Date().toISOString(),
      changefreq: page.changefreq,
      priority: page.priority
    });
  });

  try {
    // Get all approved papers for dynamic sitemap entries
    const papersQuery = query(
      collection(db, 'papers'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(1000) // Limit to prevent excessive sitemap size
    );
    
    const papersSnapshot = await getDocs(papersQuery);
    const papers = papersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaperData));

    // Add individual paper pages (using paper ID in URL)
    papers.forEach(paper => {
      if (paper.id) {
        entries.push({
          url: `${BASE_URL}/browse?paper=${paper.id}`,
          lastmod: paper.createdAt ? new Date(paper.createdAt.toDate()).toISOString() : new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        });
      }
    });

    // Add category pages based on subjects, courses, etc.
    const subjects = [...new Set(papers.map(p => p.subject).filter(Boolean))];
    const courses = [...new Set(papers.map(p => p.course).filter(Boolean))];
    const colleges = [...new Set(papers.map(p => p.college).filter(Boolean))];

    subjects.forEach(subject => {
      entries.push({
        url: `${BASE_URL}/browse?subject=${encodeURIComponent(subject)}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.7
      });
    });

    courses.forEach(course => {
      entries.push({
        url: `${BASE_URL}/browse?course=${encodeURIComponent(course)}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.7
      });
    });

    colleges.forEach(college => {
      entries.push({
        url: `${BASE_URL}/browse?college=${encodeURIComponent(college)}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      });
    });

  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error);
  }

  return entries;
};

// Generate XML sitemap content
export const generateXMLSitemap = async (): Promise<string> => {
  const entries = await generateSitemap();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${entry.url}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  return `# StudyVault robots.txt
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
};

// Google Search Console verification
export const verifySearchConsole = (verificationCode: string): void => {
  // Add Google Search Console verification meta tag
  const existingMeta = document.querySelector('meta[name="google-site-verification"]');
  if (existingMeta) {
    existingMeta.setAttribute('content', verificationCode);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = verificationCode;
    document.head.appendChild(meta);
  }
};

// Submit URL to Google Indexing API
export const submitToIndexingAPI = async (url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<boolean> => {
  const indexingApiKey = import.meta.env.VITE_GOOGLE_INDEXING_API_KEY;
  
  if (!indexingApiKey) {
    console.warn('Google Indexing API key not configured');
    return false;
  }

  try {
    // Ensure URL is absolute
    const absoluteUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    const response = await fetch(`https://indexing.googleapis.com/v3/urlNotifications:publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${indexingApiKey}`,
        'X-Goog-Api-Version': '3'
      },
      body: JSON.stringify({
        url: absoluteUrl,
        type: type
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Successfully submitted ${url} to Google Indexing API`, data);
      return true;
    } else {
      const errorData = await response.json();
      console.error('Failed to submit to Indexing API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }
  } catch (error) {
    console.error('Error submitting to Indexing API:', error);
    return false;
  }
};

// Auto-submit new papers to indexing
export const autoSubmitPaperToIndex = async (paperId: string): Promise<void> => {
  try {
    const paperUrl = `/browse?paper=${paperId}`;
    const absoluteUrl = `${BASE_URL}${paperUrl}`;
    
    // First, verify the paper exists and is approved
    const paperRef = collection(db, 'papers');
    const paperDoc = await getDocs(query(paperRef, where('id', '==', paperId), where('status', '==', 'approved')));
    
    if (paperDoc.empty) {
      console.warn(`Paper ${paperId} not found or not approved. Skipping indexing.`);
      return;
    }

    // Submit to indexing API
    const success = await submitToIndexingAPI(absoluteUrl);
    
    if (!success) {
      console.error(`Failed to submit paper ${paperId} to indexing API`);
    }
  } catch (error) {
    console.error(`Error auto-submitting paper ${paperId} to index:`, error);
  }
};

// Generate structured data for the website
export const getWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "StudyVault",
  "alternateName": "Study Vault - Academic Resources",
  "url": BASE_URL,
  "description": "Comprehensive academic resource sharing platform for students and educators",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/browse?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "StudyVault",
    "url": BASE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/assets/logo.png`,
      "width": 300,
      "height": 60
    }
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Academic Resources",
    "description": "Collection of question papers, study materials, and academic resources"
  }
});

// Declare gtag global function
declare global {
  function gtag(...args: any[]): void;
}

// Track search queries for insights
export const trackSearchQuery = (query: string, resultsCount: number): void => {
  // This could be sent to Google Analytics or your own analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', 'search', {
      'search_term': query,
      'results_count': resultsCount,
      'page_title': document.title,
      'page_location': window.location.href
    });
  }
};

// Performance metrics for Core Web Vitals
export const reportWebVitals = (metric: any): void => {
  // Report to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      'event_category': 'Web Vitals',
      'value': Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      'event_label': metric.id,
      'non_interaction': true
    });
  }
};

// SEO analysis and recommendations
export const analyzeSEO = async (): Promise<{
  score: number;
  recommendations: string[];
  criticalIssues: string[];
}> => {
  const recommendations: string[] = [];
  const criticalIssues: string[] = [];
  let score = 100;

  // Check meta description
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!metaDescription || metaDescription.length < 120) {
    criticalIssues.push('Meta description is missing or too short (should be 120-160 characters)');
    score -= 15;
  }

  // Check title tag
  const title = document.title;
  if (!title || title.length < 30 || title.length > 60) {
    criticalIssues.push('Title tag should be 30-60 characters long');
    score -= 10;
  }

  // Check structured data
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  if (!structuredData) {
    recommendations.push('Add structured data markup for better search results');
    score -= 5;
  }

  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    recommendations.push('Add canonical URL to prevent duplicate content issues');
    score -= 5;
  }

  // Check Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  
  if (!ogTitle || !ogDescription || !ogImage) {
    recommendations.push('Add Open Graph meta tags for better social media sharing');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    recommendations,
    criticalIssues
  };
}; 