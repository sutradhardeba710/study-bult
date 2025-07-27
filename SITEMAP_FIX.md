# Sitemap Fix for Google Search Console

This document explains the changes made to fix the sitemap issue in Google Search Console.

## Problem

Google Search Console reported the following error:
> Sitemap can be read, but has errors
> Sitemap is HTML
> Your Sitemap appears to be an HTML page. Please use a supported sitemap format instead.

## Root Cause

The issue was caused by the catch-all rewrite rule in `vercel.json` that was redirecting all requests (including `/sitemap.xml`) to `/index.html`. This caused the sitemap to be served with the wrong content type (`text/html` instead of `application/xml`).

## Solution

1. **Updated Vercel Configuration**
   - Modified the rewrite rule in `vercel.json` to exclude sitemap.xml, robots.txt, and Google verification files
   - Added specific headers for sitemap.xml and robots.txt to ensure they are served with the correct content types:
     - sitemap.xml: `application/xml; charset=utf-8`
     - robots.txt: `text/plain; charset=utf-8`

2. **Updated Sitemap Generation**
   - Fixed the BASE_URL in `scripts/generate-sitemap.js` to use the correct domain
   - Added new routes for help-center and FAQ pages
   - Ensured the lastmod date is set to the current date

3. **Added Testing Tools**
   - Created `scripts/test-sitemap.js` to verify that the sitemap is being served with the correct content type
   - Added `test-sitemap` script to package.json

## How to Verify the Fix

1. **After Deployment**
   - Wait for the changes to be deployed to Vercel
   - Run `npm run test-sitemap` to verify that the sitemap is being served with the correct content type
   - Visit https://study-vault2.vercel.app/sitemap.xml directly in your browser - it should display as XML, not HTML

2. **In Google Search Console**
   - Go to Google Search Console
   - Navigate to the Sitemaps section
   - Click "Test sitemap" for your sitemap
   - If the test is successful, click "Submit sitemap"

## Explanation of Changes

### 1. Vercel.json Rewrite Rule

Changed from:
```json
{ "source": "/(.*)", "destination": "/index.html" }
```

To:
```json
{ "source": "/((?!sitemap\\.xml|robots\\.txt|google[0-9a-zA-Z]+\\.html).*)", "destination": "/index.html" }
```

This uses a negative lookahead (`(?!...)`) to exclude sitemap.xml, robots.txt, and Google verification files from the catch-all rule.

### 2. Added Content Type Headers

Added specific headers for sitemap.xml and robots.txt:

```json
{
  "source": "/sitemap.xml",
  "headers": [
    { "key": "Content-Type", "value": "application/xml; charset=utf-8" },
    { "key": "Cache-Control", "value": "public, max-age=86400" }
  ]
},
{
  "source": "/robots.txt",
  "headers": [
    { "key": "Content-Type", "value": "text/plain; charset=utf-8" },
    { "key": "Cache-Control", "value": "public, max-age=86400" }
  ]
}
```

### 3. Updated Sitemap Generation

Updated the BASE_URL in `scripts/generate-sitemap.js`:

```javascript
const BASE_URL = process.env.SITE_URL || 'https://study-vault2.vercel.app';
```

### 4. Testing Script

Created a script to verify that the sitemap is being served with the correct content type:

```javascript
// scripts/test-sitemap.js
import https from 'https';

const domain = 'study-vault2.vercel.app';
const paths = ['/sitemap.xml', '/robots.txt', '/google7gNNxuxFze935OwrznhPaNPnkGQ9jFleE2MS4fO5zE0.html'];

// ... rest of the script ...
```

## Next Steps

After deploying these changes:

1. Wait for the changes to propagate (may take a few minutes)
2. Run `npm run test-sitemap` to verify the content types
3. Resubmit your sitemap in Google Search Console 