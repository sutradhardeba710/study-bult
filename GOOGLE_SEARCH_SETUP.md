# Google Search Integration Setup Guide

This guide walks you through setting up comprehensive Google Search integration for your StudyVault application, including SEO optimization, Search Console monitoring, and indexing automation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Search Console Setup](#google-search-console-setup)
3. [Google Indexing API Setup](#google-indexing-api-setup)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [SEO Features Overview](#seo-features-overview)
6. [Testing Your Setup](#testing-your-setup)
7. [Monitoring and Optimization](#monitoring-and-optimization)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:
- A deployed StudyVault website (e.g., on Vercel)
- Access to Google Cloud Console
- Admin access to your website
- Basic understanding of SEO concepts

## Google Search Console Setup

### Step 1: Verify Your Website

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property" and select "URL prefix"
3. Enter your website URL (e.g., `https://your-studyvault-domain.com`)
4. Choose verification method:

#### Option A: HTML Meta Tag (Recommended)
1. Copy the verification meta tag provided
2. Add it to your environment variables as `VITE_GOOGLE_SITE_VERIFICATION`
3. The application will automatically add it to your website

#### Option B: HTML File Upload
1. Download the verification file
2. Upload it to your `public/` directory
3. Deploy your changes

#### Option C: DNS Verification
1. Add the TXT record to your domain's DNS settings
2. Wait for DNS propagation (up to 24 hours)

### Step 2: Submit Your Sitemap

1. After verification, go to "Sitemaps" in the left sidebar
2. Add sitemap URL: `https://your-domain.com/sitemap.xml`
3. The sitemap is automatically generated and includes:
   - All static pages
   - Dynamic paper pages
   - Category pages (subjects, courses, colleges)

### Step 3: Enable Search Console API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google Search Console API"
4. Create credentials (API Key)
5. Add the API key to your environment variables

## Google Indexing API Setup

### Step 1: Enable the API

1. In Google Cloud Console, enable "Indexing API"
2. Create a service account for the Indexing API
3. Download the service account JSON key
4. Grant the service account "Search Console Owner" permissions

### Step 2: Configure Authentication

1. Add service account email to Search Console as an owner
2. Store the API key in your environment variables
3. The application will automatically submit new papers for indexing

## Environment Variables Configuration

Add these variables to your `.env.local` file:

```bash
# Google Search Integration
VITE_GOOGLE_SEARCH_CONSOLE_API_KEY=your-search-console-api-key
VITE_GOOGLE_INDEXING_API_KEY=your-indexing-api-key
VITE_GOOGLE_SITE_VERIFICATION=your-site-verification-code
VITE_SITE_URL=https://your-actual-domain.com

# Existing Google Services
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### For Vercel Deployment

Add the same environment variables in your Vercel project dashboard:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the Google Search variables
4. Redeploy your application

## SEO Features Overview

### Automatic SEO Optimization

The application now includes:

1. **Dynamic Meta Tags**: Each page has optimized title, description, and keywords
2. **Open Graph Tags**: For social media sharing
3. **Twitter Cards**: Enhanced social sharing on Twitter
4. **Structured Data**: JSON-LD markup for rich search results
5. **Canonical URLs**: Prevent duplicate content issues

### Search Console Integration

- **Performance Monitoring**: Track clicks, impressions, CTR, and positions
- **Query Analysis**: See what users search for to find your content
- **Page Performance**: Monitor which pages perform best
- **Indexing Status**: Check which pages are indexed by Google

### Automatic Indexing

- **New Paper Submission**: Automatically submits new papers to Google
- **Sitemap Updates**: Dynamic sitemap generation with caching
- **Real-time Updates**: Immediate notification to Google about new content

### Admin Dashboard

Access the SEO dashboard at `/admin/seo` to:
- View search performance metrics
- Monitor SEO health score
- Get optimization recommendations
- Generate and submit sitemaps
- Track top-performing content

## Testing Your Setup

### 1. Verify SEO Implementation

```bash
# Check if meta tags are properly set
curl -s https://your-domain.com | grep -E '<meta|<title'

# Verify sitemap accessibility
curl -s https://your-domain.com/sitemap.xml

# Check robots.txt
curl -s https://your-domain.com/robots.txt
```

### 2. Test Search Console Integration

1. Log into your admin dashboard
2. Navigate to `/admin/seo`
3. Click "Refresh" to test API connectivity
4. Verify metrics are loading

### 3. Validate Structured Data

Use Google's [Rich Results Test](https://search.google.com/test/rich-results):
1. Enter your website URL
2. Check for structured data validation
3. Fix any errors reported

## Monitoring and Optimization

### Weekly Tasks

1. **Check SEO Dashboard**: Review performance metrics
2. **Monitor Indexing**: Ensure new content is being indexed
3. **Review Top Queries**: Identify content opportunities
4. **Check Page Performance**: Optimize low-performing pages

### Monthly Tasks

1. **Generate Performance Report**: Analyze trends
2. **Update Meta Descriptions**: Improve low-CTR pages
3. **Content Optimization**: Create content for popular queries
4. **Technical SEO Audit**: Check for crawl errors

### Key Metrics to Monitor

- **Organic Traffic Growth**: Track month-over-month growth
- **Click-Through Rate (CTR)**: Target >3% average CTR
- **Average Position**: Aim to improve positions over time
- **Indexed Pages**: Ensure all important pages are indexed

## Troubleshooting

### Common Issues

#### 1. "Search Console API not configured" Error
- Verify your API key is correct
- Check that the Search Console API is enabled
- Ensure your domain is verified in Search Console

#### 2. Sitemap Not Accessible
- Check if your server routes are properly configured
- Verify Firebase connection for dynamic content
- Test sitemap URL directly in browser

#### 3. Low SEO Score
- Review critical issues in the admin dashboard
- Ensure meta descriptions are 120-160 characters
- Add missing Open Graph tags
- Implement structured data

#### 4. Indexing Issues
- Verify Indexing API credentials
- Check service account permissions
- Monitor quotas in Google Cloud Console

### Debug Mode

Enable debug logging by adding to your environment:
```bash
VITE_SEO_DEBUG=true
```

This will log SEO operations to the browser console.

## Advanced Configuration

### Custom Schema Markup

The application supports custom structured data:

```typescript
import { useSEO, generateStructuredData } from '../hooks/useSEO';

// Custom educational resource markup
useSEO({
  structuredData: generateStructuredData.educationalResource({
    title: 'Advanced Mathematics Question Paper',
    subject: 'Mathematics',
    course: 'B.Tech',
    semester: '3rd Semester'
  })
});
```

### Performance Optimization

For better SEO performance:

1. **Enable Compression**: Ensure gzip/brotli compression
2. **Optimize Images**: Use WebP format where possible
3. **Minimize JavaScript**: Keep bundle size under 250KB
4. **Improve Core Web Vitals**: Monitor LCP, FID, and CLS

### International SEO

For multi-language support:

```typescript
useSEO({
  title: 'StudyVault - Academic Resources',
  description: 'Discover academic papers and study materials',
  keywords: ['academic', 'papers', 'study'],
  url: 'https://studyvault.com/en',
  type: 'website',
  locale: 'en_US'
});
```

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Google Search Console for crawl errors
3. Monitor the admin SEO dashboard for alerts
4. Consult Google's official documentation

## Security Considerations

- **API Keys**: Never expose API keys in client-side code
- **Rate Limiting**: Respect Google API rate limits
- **Authentication**: Use service accounts for server-side APIs
- **Permissions**: Grant minimal required permissions

---

**Next Steps**: After completing this setup, monitor your search performance regularly and optimize based on the data you collect. The SEO dashboard provides actionable insights to improve your search visibility over time. 