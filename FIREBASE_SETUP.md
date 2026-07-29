# Firebase Setup Guide for StudyVault

## Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "StudyVault" (or your preferred name)
4. Follow the setup wizard

## Step 2: Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" authentication
3. Optionally enable "Google" for OAuth

## Step 3: Enable Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location close to your users

## Step 4: Enable Storage
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" (for development)
3. Select a location close to your users

## Step 5: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app and copy the config

## Step 6: Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 7: Security Rules (Optional)
Update Firestore and Storage security rules for production use.

## Step 8: Test
Run the app and test registration/login functionality. 