import React from 'react';
import { Head } from 'vite-react-ssg';
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
    title = 'Previous Year Question Paper PDF Download | All Semesters & Exams | Study Volte',
    description = 'Free download previous year question papers (PYQ), last year papers, and semester exam papers for MBBU, BBMC, Tripura University, BA, BSc, BCom, BCA, CUET & SSC. Fast PDF downloads.',
    keywords = 'previous year question paper, previous year question paper pdf, previous year question paper pdf download, last year question paper, question paper download, semester question papers, college question papers, mbbu previous year question paper, bbmc question paper, tripura university question paper, ba question paper, bsc question paper, bcom question paper, bca question paper, pyq download, study volte, studybult, study bult',
    image = 'https://study-volte.site/logo-optimized.webp',
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



    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Robots */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            )}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:site_name" content="Study Volte" />
            <meta property="og:locale" content="en_IN" />
            <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />

            {/* Article Specific Tags */}
            {type === 'article' && author && <meta property="article:author" content={author} />}
            {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {type === 'article' && section && <meta property="article:section" content={section} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:site" content="@studybult" />
            <meta name="twitter:creator" content="@studybult" />

            {/* Additional Tags */}
            <meta name="application-name" content="Study Volte" />
            <meta name="apple-mobile-web-app-title" content="Study Volte" />
            <meta name="theme-color" content="#6366f1" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />


        </Head>
    );
};

export default SEOHead;
