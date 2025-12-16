import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'article';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title = 'Study Volte - Academic Resource Sharing Platform',
    description = 'Access and share question papers, study materials, and academic resources from universities and colleges. Download previous year papers, upload notes, and connect with students worldwide.',
    keywords = 'question papers, study materials, previous year papers, exam papers, university notes, college resources, academic sharing, study vault',
    image = 'https://study-volte.site/og-image.png',
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    section,
    noindex = false,
}) => {
    const location = useLocation();
    const siteUrl = 'https://study-volte.site';
    const canonicalUrl = `${siteUrl}${location.pathname}`;
    const fullTitle = title.includes('Study Volte') ? title : `${title} | Study Volte`;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, attributeType: 'name' | 'property' = 'name') => {
            let element = document.querySelector(`meta[${attributeType}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attributeType, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update or create link tags
        const updateLinkTag = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
            if (!element) {
                element = document.createElement('link');
                element.setAttribute('rel', rel);
                document.head.appendChild(element);
            }
            element.setAttribute('href', href);
        };

        // Basic meta tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);

        // Robots
        if (noindex) {
            updateMetaTag('robots', 'noindex, nofollow');
        } else {
            updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        }

        // Canonical URL
        updateLinkTag('canonical', canonicalUrl);

        // Open Graph tags for Facebook, LinkedIn, etc.
        updateMetaTag('og:title', fullTitle, 'property');
        updateMetaTag('og:description', description, 'property');
        updateMetaTag('og:type', type, 'property');
        updateMetaTag('og:url', canonicalUrl, 'property');
        updateMetaTag('og:image', image, 'property');
        updateMetaTag('og:image:alt', title, 'property');
        updateMetaTag('og:site_name', 'Study Volte', 'property');
        updateMetaTag('og:locale', 'en_US', 'property');

        // Article-specific OG tags
        if (type === 'article') {
            if (author) updateMetaTag('article:author', author, 'property');
            if (publishedTime) updateMetaTag('article:published_time', publishedTime, 'property');
            if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, 'property');
            if (section) updateMetaTag('article:section', section, 'property');
        }

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', fullTitle);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);
        updateMetaTag('twitter:image:alt', title);
        // updateMetaTag('twitter:site', '@studyvolte'); // Add when you have Twitter
        // updateMetaTag('twitter:creator', '@studyvolte'); // Add when you have Twitter

        // Additional SEO tags
        updateMetaTag('application-name', 'Study Volte');
        updateMetaTag('apple-mobile-web-app-title', 'Study Volte');
        updateMetaTag('theme-color', '#6366f1');
        updateMetaTag('mobile-web-app-capable', 'yes');
        updateMetaTag('apple-mobile-web-app-capable', 'yes');
        updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    }, [fullTitle, description, keywords, canonicalUrl, image, type, author, publishedTime, modifiedTime, section, noindex]);

    return null; // This component doesn't render anything
};

export default SEOHead;
