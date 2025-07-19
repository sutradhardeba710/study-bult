# Setting Up Environment Variables in Vercel

Your Firebase authentication is not working on the deployed Vercel site because the environment variables are missing. Follow these steps to set them up:

## Option 1: Using Vercel Dashboard (Recommended for Beginners)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your StudyVault project
3. Click on the "Settings" tab
4. Navigate to the "Environment Variables" section
5. Add each of the following variables from your `.env.local` file:

```
VITE_FIREBASE_API_KEY=AIzaSyBQ5NqH5_v8R1mc9VXTXrFwyzVofafpV28
VITE_FIREBASE_AUTH_DOMAIN=studyvault-4ec70.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studyvault-4ec70
VITE_FIREBASE_STORAGE_BUCKET=studyvault-4ec70.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=138709067049
VITE_FIREBASE_APP_ID=1:138709067049:web:c455d2e31e4226f7e3c338
```

6. For the API URL, you need to update it to point to your deployed backend:
   - If you're using Vercel for both frontend and backend, it might be something like:
   ```
   VITE_API_URL=https://studyvault.vercel.app/api/test-email
   ```
   - If you're using a different service for the backend, use that URL instead

7. Add any other environment variables you need:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=dwnbmgdhr
   VITE_CLOUDINARY_UPLOAD_PRESET=studyvault_upload
   ```

8. Click "Save" to save your environment variables
9. Redeploy your project by clicking on the "Deployments" tab and then "Redeploy" on your latest deployment

## Option 2: Using Vercel CLI

If you prefer using the command line, you can use the Vercel CLI to set up environment variables:

1. Install Vercel CLI if you haven't already:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Make sure you're in your project directory and it's linked to Vercel:
   ```
   vercel link
   ```

4. Run the script we created to set up environment variables:
   ```
   node setup-vercel-env.js
   ```

5. Redeploy your project:
   ```
   vercel --prod
   ```

## Troubleshooting

If you're still having issues after setting up the environment variables:

1. Make sure all the required variables are set correctly
2. Check that the Firebase project exists and is properly configured
3. Verify that the Firebase project allows authentication from your Vercel domain
4. Check the Firebase console for any authentication restrictions
5. Look at the browser console for more specific error messages

Remember to redeploy your application after setting up the environment variables for the changes to take effect. 