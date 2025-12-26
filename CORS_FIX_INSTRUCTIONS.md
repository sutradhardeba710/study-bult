# Fix PDF Thumbnail CORS Issues

## Problem
PDF.js cannot load PDFs from Firebase Storage due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solution
Apply CORS configuration to your Firebase Storage bucket.

### Step 1: Install Google Cloud SDK (if not already installed)
If you haven't installed the Google Cloud SDK, download it from:
https://cloud.google.com/sdk/docs/install

### Step 2: Authenticate with Google Cloud
```bash
gcloud auth login
```

### Step 3: Set your Firebase project
```bash
# Replace with your actual project ID from .firebaserc
gcloud config set project study-volt-82144
```

### Step 4: Apply CORS configuration
Run this command in your project root directory (where cors.json is located):

```bash
gsutil cors set cors.json gs://study-volt-82144.appspot.com
```

### Step 5: Verify CORS configuration
```bash
gsutil cors get gs://study-volt-82144.appspot.com
```

## Alternative: Use Firebase Console

If you prefer using the Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select your project: **study-volt-82144**
3. Go to **Storage** in the left sidebar
4. Click on **Rules** tab
5. The CORS must be set via command line (gsutil) as shown above

## After Applying CORS

1. Wait 1-2 minutes for changes to propagate
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. PDF thumbnails should now load and display actual preview content

## Troubleshooting

If thumbnails still don't load:
1. Check browser console for specific error messages
2. Verify your Firebase project ID matches
3. Ensure you have owner/editor permissions on the Firebase project
4. Try clearing browser cache completely
