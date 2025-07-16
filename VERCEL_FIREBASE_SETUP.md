# Vercel and Firebase Setup Guide

## Fix 404 Errors for Routes

The `vercel.json` file in your project root will handle routing for your React application. This ensures that when users navigate directly to routes like `/login` or `/register`, or when they refresh the page, Vercel will serve the main `index.html` file instead of returning a 404 error.

## Fix Firebase Unauthorized Domain Error

To fix the `Firebase: Error (auth/unauthorized-domain)` error, you need to add your Vercel domain to the list of authorized domains in Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on **Authentication**
4. Click on the **Settings** tab
5. Scroll down to the **Authorized domains** section
6. Click **Add domain**
7. Enter your Vercel domain: `study-vault-gamma.vercel.app`
8. Click **Add**

![Firebase Authorized Domains](https://i.imgur.com/example-image.png)

## Environment Variables in Vercel

Make sure all required environment variables are set in your Vercel project:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your StudyVault project
3. Go to **Settings** > **Environment Variables**
4. Add all the variables from your `.env.local` file:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. Add any other environment variables your app needs
6. Click **Save**
7. Redeploy your application

## Verifying the Setup

After making these changes:

1. Redeploy your application to Vercel
2. Test direct navigation to routes like `/login` and `/register`
3. Test the Google Sign-In functionality
4. Check the browser console for any remaining errors

If you still encounter issues, check the Vercel deployment logs for more information. 