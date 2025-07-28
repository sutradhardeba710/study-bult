import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

const DEFAULT_SEO = {
  title: 'StudyVault - Academic Resource Sharing Platform',
  description: 'Discover and share academic papers, question papers, and study materials from universities and colleges. Join thousands of students in collaborative learning.',
  keywords: ['study materials', 'question papers', 'academic resources', 'university papers', 'college exams', 'student platform'],
  image: '/assets/og-image.jpg',
  url: 'https://study-vault-gamma.vercel.app',
  type: 'website' as const
};

export const useSEO = (seoProps: SEOProps = {}) => {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = DEFAULT_SEO.type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noIndex = false,
    structuredData
  } = seoProps;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description, false);
    updateMetaTag('keywords', keywords.join(', '), false);
    
    // Robots meta
    updateMetaTag('robots', noIndex ? 'noindex,nofollow' : 'index,follow', false);
    
    // Open Graph meta tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'StudyVault');
    
    if (author) updateMetaTag('og:author', author);
    if (publishedTime) updateMetaTag('article:published_time', publishedTime);
    if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime);
    if (section) updateMetaTag('article:section', section);
    if (tags) {
      tags.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.content = tag;
        document.head.appendChild(tagMeta);
      });
    }

    // Twitter Card meta tags
    updateMetaTag('twitter:card', image ? 'summary_large_image' : 'summary', false);
    updateMetaTag('twitter:title', title, false);
    updateMetaTag('twitter:description', description, false);
    if (image) updateMetaTag('twitter:image', image, false);
    updateMetaTag('twitter:site', '@StudyVault', false);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Structured Data
    if (structuredData) {
      let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script') as HTMLScriptElement;
        structuredDataScript.id = 'structured-data';
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function to remove duplicate meta tags
    return () => {
      // Remove duplicate article:tag meta tags
      if (tags) {
        const tagMetas = document.querySelectorAll('meta[property="article:tag"]');
        tagMetas.forEach(meta => meta.remove());
      }
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, section, tags, noIndex, structuredData]);

  // Return function to update structured data dynamically
  const updateStructuredData = (data: Record<string, any>) => {
    let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script') as HTMLScriptElement;
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(data);
  };

  return { updateStructuredData };
};

// Helper function to generate structured data for different content types
export const generateStructuredData = {
  website: (data: { name: string; url: string; description: string }) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": data.name,
    "url": data.url,
    "description": data.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${data.url}/browse?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }),
  
  educationalResource: (paper: any) => ({
    "@context": "https://schema.org",
    "@type": "EducationalResource",
    "name": paper.title,
    "description": paper.description || `${paper.subject} question paper for ${paper.course}`,
    "educationalLevel": paper.semester,
    "about": paper.subject,
    "learningResourceType": "Question Paper",
    "inLanguage": "en",
    "dateCreated": paper.createdAt,
    "creator": {
      "@type": "Person",
      "name": paper.uploaderName
    },
    "publisher": {
      "@type": "Organization",
      "name": "StudyVault"
    },
    "url": `${DEFAULT_SEO.url}/browse`,
    "keywords": [paper.subject, paper.course, paper.semester, "question paper", "exam paper"]
  }),

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),

  faq: (faqs: Array<{ question: string; answer: string }>) => ({
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
  })
}; 