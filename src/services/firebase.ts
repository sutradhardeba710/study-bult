import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace with your actual Firebase config or use environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Improved configuration validation
const isConfigValid = () => {
  // Check if any config value contains placeholder text
  const hasPlaceholders = Object.values(firebaseConfig).some(
    value => typeof value === 'string' && (
      value.includes('your-') || 
      value === 'undefined' || 
      value.length < 5
    )
  );
  
  // Check if required fields are present and not placeholders
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingRequiredFields = requiredFields.some(
    field => !firebaseConfig[field] || 
            typeof firebaseConfig[field] !== 'string' || 
            firebaseConfig[field].includes('your-')
  );
  
  // Check if we're in a development environment
  const isDevelopment = import.meta.env.DEV;
  
  // Log warnings in development
  if (isDevelopment && (hasPlaceholders || missingRequiredFields)) {
    console.warn('⚠️ Firebase configuration is incomplete. Authentication and other Firebase features may not work correctly.');
    console.warn('Please check your environment variables and ensure they are properly set.');
  }
  
  return !hasPlaceholders && !missingRequiredFields;
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Export config validation
export const isFirebaseConfigured = isConfigValid();

// Log configuration status in development
if (import.meta.env.DEV) {
  console.log(`Firebase configuration status: ${isFirebaseConfigured ? 'Valid ✅' : 'Invalid ❌'}`);
  if (!isFirebaseConfigured) {
    console.log('Please check your .env file and ensure all Firebase variables are set correctly.');
  }
}

export default app; 