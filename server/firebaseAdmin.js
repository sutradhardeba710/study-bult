const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
// Then load from .env (which would override any duplicates)
dotenv.config();

// Check if Firebase Admin has been initialized
if (!admin.apps.length) {
  try {
    // If service account is available in environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      });
    } 
    // If running locally or using application default credentials
    else {
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      });
    }
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

module.exports = admin; 