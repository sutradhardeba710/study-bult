# Apply CORS Configuration to Firebase Storage

## Quick Fix - Run these commands:

### 1. Set your Firebase project
```powershell
gcloud config set project studyvault-4ec70
```

### 2. Apply CORS configuration
```powershell
gsutil cors set cors.json gs://studyvault-4ec70.appspot.com
```

### 3. Verify it worked
```powershell
gsutil cors get gs://studyvault-4ec70.appspot.com
```

## What this does:
- Allows PDF.js to load PDF files from Firebase Storage
- Enables proper Range requests needed for PDF rendering
- Fixes CORS errors showing in browser console

## After running these commands:
1. Wait 1-2 minutes
2. Hard refresh browser (Ctrl+Shift+R)
3. PDF thumbnails will show actual PDF previews instead of just colors
