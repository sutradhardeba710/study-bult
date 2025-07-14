# Google Services Setup Guide for StudyVault

This guide explains how to set up various Google services for the StudyVault application.

## Table of Contents
1. [Google Authentication](#google-authentication)
2. [Google Analytics](#google-analytics)
3. [Google Maps API](#google-maps-api)
4. [Google reCAPTCHA](#google-recaptcha)
5. [Google Search Console](#google-search-console)
6. [Environment Variables](#environment-variables)

## Google Authentication

To enable Google Sign-In for your application:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Configure the OAuth consent screen with your app information
6. Add your domain to the authorized domains list

## Google Analytics

To set up Google Analytics:

1. Go to the [Google Analytics Console](https://analytics.google.com/)
2. Create a new property for your website
3. Set up a data stream for your web application
4. Copy the Measurement ID (starts with "G-")
5. Add this ID to your environment variables as `VITE_GOOGLE_ANALYTICS_ID`

## Google Maps API

To enable Google Maps in your application:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable the following APIs:
   - Maps JavaScript API
   - Places API (if you need location search)
   - Geocoding API (if you need address lookup)
5. Create an API key under **APIs & Services** > **Credentials**
6. Restrict the API key to your domains for security
7. Add this key to your environment variables as `VITE_GOOGLE_MAPS_API_KEY`

## Google reCAPTCHA

To protect your forms with reCAPTCHA:

1. Go to the [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register a new site
3. Choose reCAPTCHA v3 (recommended for best user experience)
4. Add your domain(s)
5. Copy the Site Key
6. Add this key to your environment variables as `VITE_GOOGLE_RECAPTCHA_SITE_KEY`

## Google Search Console

To verify your website ownership and optimize for search:

1. Go to the [Google Search Console](https://search.google.com/search-console)
2. Add your property (website) by entering your domain or URL prefix
3. Choose the HTML tag verification method
4. Copy the verification ID (the content value of the meta tag)
5. Add this ID to your environment variables as `VITE_GOOGLE_SEARCH_CONSOLE_ID`
6. The app will automatically add the verification meta tag to your site
7. Return to Search Console and click "Verify"

After verification:

1. Submit your sitemap.xml by going to **Sitemaps** > **Add a new sitemap**
2. Enter "sitemap.xml" and click "Submit"
3. Check for any crawl errors or issues in the Coverage report
4. Monitor your site's performance in search results

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Google Services
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
VITE_GOOGLE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_GOOGLE_SEARCH_CONSOLE_ID=your-search-console-verification-id
```

Replace the placeholder values with your actual API keys and configuration values.

## Testing Your Integration

After setting up the services and environment variables:

1. Run your application with `npm run dev`
2. Test Google Sign-In on the login and register pages
3. Check the browser console to verify Google Analytics, Maps, and reCAPTCHA are loading
4. Use browser developer tools to confirm network requests to Google services are successful
5. Verify that the Google Search Console meta tag is present in your HTML head

## Troubleshooting

If you encounter issues:

- Verify that all API keys are correct
- Check that the services are enabled in the Google Cloud Console
- Ensure your domain is authorized for each service
- Look for CORS or CSP errors in the browser console
- Verify that environment variables are being loaded correctly 