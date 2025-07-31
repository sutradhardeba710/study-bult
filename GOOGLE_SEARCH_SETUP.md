# Google Search Integration Setup

This guide will help you set up Google Search integration for StudyVault, including proper sitemap configuration, Google Search Console verification, and programmatic indexing.

## Prerequisites

1. A Google account
2. Access to [Google Search Console](https://search.console.google.com)
3. A Google Cloud Platform account for API access

## Step 1: Create a Google Search Console Property

1. Go to [Google Search Console](https://search.console.google.com)
2. Click "Add Property"
3. Enter your website URL (e.g., `https://study-vault2.vercel.app`)
4. Choose the verification method:
   - HTML file upload
   - HTML meta tag
   - DNS record
   - Google Analytics
   - Google Tag Manager

The meta tag verification is already set up in `index.html`. If you need to change it:

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

## Step 2: Set Up Google Cloud Project for API Access

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Search Console API
   - Indexing API
4. Create a service account with the following roles:
   - Search Console API (Owner)
5. Generate and download a JSON key file
6. Rename this file to `credentials.json` and place it in the `/server` directory

## Step 3: Configure the Backend

1. Ensure the `credentials.json` file is in the server directory
2. Update the site URL in `server/google-search-console-api.js` if needed:

```javascript
this.siteUrl = 'https://your-site-url.com/';
```

## Step 4: Admin Access to Google Search Features

Once everything is set up, administrators can access the Google Search dashboard at:

```
/admin/google-search
```

This dashboard allows you to:
- Submit your sitemap to Google
- Check sitemap indexing status
- Request specific URL indexing
- Generate fresh sitemaps

## Step 5: Sitemap Configuration

Our sitemap is generated in two ways:

1. **Static sitemap** - Contains the main site pages
2. **Dynamic sitemap** - Generated from database content (papers, categories, etc.)

You can customize the sitemap generation in:
- `server/routes/sitemap.js`
- `server/react-vite-sitemap-generator.js`

## Step 6: Robots.txt Configuration

The `robots.txt` file is automatically generated at `/robots.txt` with the correct Googlebot configurations. This ensures Google can properly crawl your site while avoiding private areas.

Key settings include:

```
User-agent: Googlebot
Allow: /

Disallow: /admin/
Disallow: /dashboard/
Disallow: /login
```

## Step 7: Testing Indexing

1. Submit your sitemap via the admin panel
2. Check Google Search Console to verify reception
3. Test crawling by requesting indexing for specific URLs

## Troubleshooting

**Sitemap not being indexed:**
- Ensure your site is verified in Google Search Console
- Check for robots.txt errors
- Verify the sitemap URL is correct
- Make sure the sitemap format is valid

**API errors:**
- Check that credentials.json is properly formatted
- Verify API permissions and roles
- Ensure proper API scopes are enabled

**404 errors in Search Console:**
- Verify dynamic routes are properly handling server-side rendering
- Check for broken links in your sitemap

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Indexing API Documentation](https://developers.google.com/search/apis/indexing-api/v3/reference)
- [Search Console API Documentation](https://developers.google.com/webmaster-tools/search-console-api-original/v3/welcome)

For additional assistance, contact the project maintainers. 