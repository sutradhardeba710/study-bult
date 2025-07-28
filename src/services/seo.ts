import type { PaperData } from './upload';
import type { UserProfile } from '../context/AuthContext';

export interface SEOMetaData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: 'website' | 'article';
  twitterCard: 'summary' | 'summary_large_image';
  structuredData: any;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Base URL for the application
const BASE_URL = 'https://study-vault-gamma.vercel.app';

// Default meta data
const DEFAULT_META: Partial<SEOMetaData> = {
  ogImage: `${BASE_URL}/assets/og-image.jpg`,
  twitterCard: 'summary_large_image',
  keywords: ['question papers', 'study material', 'academic resources', 'exam preparation', 'student portal'],
};

// Generate SEO meta data for different pages
export const generateSEOMeta = {
  
  // Home page SEO
  home: (): SEOMetaData => ({
    title: 'StudyVault - Academic Resource Sharing Platform | Question Papers & Study Materials',
    description: 'Access thousands of question papers from colleges across the country. Upload, search, and download academic resources to ace your exams. Join 50,000+ students on StudyVault.',
    keywords: [...DEFAULT_META.keywords!, 'college papers', 'university exams', 'study vault', 'academic portal'],
    canonicalUrl: BASE_URL,
    ogTitle: 'StudyVault - Your Gateway to Academic Success',
    ogDescription: 'Access thousands of question papers from colleges. Upload, search, and download academic resources.',
    ogImage: DEFAULT_META.ogImage!,
    ogType: 'website',
    twitterCard: DEFAULT_META.twitterCard!,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "StudyVault",
      "url": BASE_URL,
      "description": "Academic resource sharing platform for students",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${BASE_URL}/browse?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "StudyVault",
        "url": BASE_URL
      }
    }
  }),

  // Browse page SEO
  browse: (filters?: { college?: string; course?: string; subject?: string }): SEOMetaData => {
    const title = filters 
      ? `${filters.subject || filters.course || filters.college || 'Question Papers'} - Browse StudyVault`
      : 'Browse Question Papers - StudyVault';
    
    const description = filters
      ? `Find ${filters.subject || 'question papers'} for ${filters.course || ''} ${filters.college || 'colleges'}. Download academic resources instantly.`
      : 'Browse thousands of question papers from colleges across India. Filter by college, course, semester, and subject.';

    return {
      title,
      description,
      keywords: [...DEFAULT_META.keywords!, 'browse papers', 'filter papers', filters?.subject || '', filters?.course || ''].filter(Boolean),
      canonicalUrl: `${BASE_URL}/browse`,
      ogTitle: title,
      ogDescription: description,
      ogImage: DEFAULT_META.ogImage!,
      ogType: 'website',
      twitterCard: DEFAULT_META.twitterCard!,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": `${BASE_URL}/browse`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Question Papers",
          "description": "Collection of academic question papers"
        }
      }
    };
  },

  // Individual paper page SEO
  paper: (paper: PaperData): SEOMetaData => {
    const title = `${paper.title} - ${paper.subject} | ${paper.course} Question Paper`;
    const description = `Download ${paper.title} question paper for ${paper.subject}. ${paper.course} ${paper.semester} semester exam paper uploaded by ${paper.uploaderName}.`;
    
    return {
      title,
      description,
      keywords: [...DEFAULT_META.keywords!, paper.subject, paper.course, paper.semester, paper.examType, paper.title],
      canonicalUrl: `${BASE_URL}/paper/${paper.id}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: paper.thumbnailUrl || DEFAULT_META.ogImage!,
      ogType: 'article',
      twitterCard: DEFAULT_META.twitterCard!,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "DigitalDocument",
        "name": paper.title,
        "description": description,
        "url": `${BASE_URL}/paper/${paper.id}`,
        "author": {
          "@type": "Person",
          "name": paper.uploaderName
        },
        "datePublished": paper.createdAt,
        "dateModified": paper.updatedAt || paper.createdAt,
        "publisher": {
          "@type": "Organization",
          "name": "StudyVault"
        },
        "educationalUse": "examination",
        "learningResourceType": "question paper",
        "educationalLevel": paper.semester,
        "about": {
          "@type": "Course",
          "name": paper.course,
          "description": `${paper.subject} course materials`
        }
      }
    };
  },

  // User profile page SEO
  profile: (user: UserProfile): SEOMetaData => ({
    title: `${user.name} - StudyVault Profile`,
    description: `View ${user.name}'s profile on StudyVault. ${user.college} student sharing academic resources.`,
    keywords: [...DEFAULT_META.keywords!, user.name, user.college, user.course],
    canonicalUrl: `${BASE_URL}/profile/${user.uid}`,
    ogTitle: `${user.name} - StudyVault`,
    ogDescription: `${user.name}'s academic profile on StudyVault`,
    ogImage: user.avatar || DEFAULT_META.ogImage!,
    ogType: 'website',
    twitterCard: DEFAULT_META.twitterCard!,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": user.name,
      "url": `${BASE_URL}/profile/${user.uid}`,
      "description": `Student at ${user.college}`,
      "affiliation": {
        "@type": "Organization",
        "name": user.college
      }
    }
  }),

  // Dashboard SEO
  dashboard: (): SEOMetaData => ({
    title: 'Dashboard - StudyVault',
    description: 'Manage your uploads, liked papers, and account settings on StudyVault.',
    keywords: [...DEFAULT_META.keywords!, 'dashboard', 'my papers', 'account'],
    canonicalUrl: `${BASE_URL}/dashboard`,
    ogTitle: 'StudyVault Dashboard',
    ogDescription: 'Manage your academic resources and account',
    ogImage: DEFAULT_META.ogImage!,
    ogType: 'website',
    twitterCard: DEFAULT_META.twitterCard!,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Dashboard",
      "url": `${BASE_URL}/dashboard`
    }
  })
};

// Generate breadcrumb structured data
export const generateBreadcrumbs = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Update document head with meta tags
export const updateDocumentMeta = (meta: SEOMetaData) => {
  // Update title
  document.title = meta.title;

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let tag = document.querySelector(selector) as HTMLMetaElement;
    
    if (!tag) {
      tag = document.createElement('meta');
      if (property) {
        tag.setAttribute('property', name);
      } else {
        tag.setAttribute('name', name);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = meta.canonicalUrl;

  // Basic meta tags
  updateMetaTag('description', meta.description);
  updateMetaTag('keywords', meta.keywords.join(', '));

  // Open Graph tags
  updateMetaTag('og:title', meta.ogTitle, true);
  updateMetaTag('og:description', meta.ogDescription, true);
  updateMetaTag('og:image', meta.ogImage, true);
  updateMetaTag('og:type', meta.ogType, true);
  updateMetaTag('og:url', meta.canonicalUrl, true);

  // Twitter tags
  updateMetaTag('twitter:card', meta.twitterCard);
  updateMetaTag('twitter:title', meta.ogTitle);
  updateMetaTag('twitter:description', meta.ogDescription);
  updateMetaTag('twitter:image', meta.ogImage);

  // Update structured data
  let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
  if (!structuredDataScript) {
    structuredDataScript = document.createElement('script');
    structuredDataScript.type = 'application/ld+json';
    document.head.appendChild(structuredDataScript);
  }
  structuredDataScript.textContent = JSON.stringify(meta.structuredData, null, 2);
};

// Generate FAQ structured data for help pages
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Generate organization structured data
export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StudyVault",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "description": "Academic resource sharing platform for students",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@studyvault.com"
  },
  "sameAs": [
    "https://www.facebook.com/studyvault",
    "https://www.twitter.com/studyvault",
    "https://www.linkedin.com/company/studyvault"
  ]
});

// SEO utilities for specific actions
export const seoUtils = {
  // Generate meta for search results page
  searchResults: (query: string, resultCount: number): SEOMetaData => ({
    title: `"${query}" - Search Results | StudyVault`,
    description: `Found ${resultCount} question papers for "${query}". Download academic resources instantly from StudyVault.`,
    keywords: [...DEFAULT_META.keywords!, query, 'search results'],
    canonicalUrl: `${BASE_URL}/browse?q=${encodeURIComponent(query)}`,
    ogTitle: `Search: ${query} - StudyVault`,
    ogDescription: `${resultCount} question papers found for "${query}"`,
    ogImage: DEFAULT_META.ogImage!,
    ogType: 'website',
    twitterCard: DEFAULT_META.twitterCard!,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": `Search results for "${query}"`,
      "url": `${BASE_URL}/browse?q=${encodeURIComponent(query)}`
    }
  }),

  // Generate sitemap data
  generateSitemapUrls: (papers: PaperData[]) => {
    const baseUrls = [
      { url: BASE_URL, changefreq: 'daily', priority: 1.0 },
      { url: `${BASE_URL}/browse`, changefreq: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/upload`, changefreq: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/about`, changefreq: 'monthly', priority: 0.5 },
      { url: `${BASE_URL}/contact`, changefreq: 'monthly', priority: 0.5 },
      { url: `${BASE_URL}/faq`, changefreq: 'monthly', priority: 0.5 },
    ];

    const paperUrls = papers.map(paper => ({
      url: `${BASE_URL}/paper/${paper.id}`,
      changefreq: 'weekly' as const,
      priority: 0.8,
      lastmod: paper.updatedAt || paper.createdAt
    }));

    return [...baseUrls, ...paperUrls];
  }
}; 