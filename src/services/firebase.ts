import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Helper to get environment variables in both Vite and Node environments
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return process.env[key];
};

// Your Firebase configuration
// Replace with your actual Firebase config or use environment variables
const firebaseConfig: { [key: string]: any } = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || "your-api-key",
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || "your-project.firebaseapp.com",
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || "your-project-id",
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || "your-project.appspot.com",
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "your-sender-id",
  appId: getEnv('VITE_FIREBASE_APP_ID') || "your-app-id"
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
  const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

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

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

export const db = getFirestore(app);
export const storage = getStorage(app);

let functionsInstance: any = null;
try {
  functionsInstance = getFunctions(app);
} catch (error) {
  console.warn('Firebase Functions service not available:', error);
}
export const functions = functionsInstance;

export const googleProvider = new GoogleAuthProvider();

// Export config validation
export const isFirebaseConfigured = isConfigValid();

// Log configuration status in development
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  console.log(`Firebase configuration status: ${isFirebaseConfigured ? 'Valid ✅' : 'Invalid ❌'}`);
  if (!isFirebaseConfigured) {
    console.log('Please check your .env file and ensure all Firebase variables are set correctly.');
  }
}

export default app;