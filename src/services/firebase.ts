import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration with hardcoded values
const firebaseConfig = {
  apiKey: "AIzaSyBfFBYgZpSUXpIUXfpS6Wr9vPfbcSHNxpk",
  authDomain: "study-vault-e1c59.firebaseapp.com",
  projectId: "study-vault-e1c59",
  storageBucket: "study-vault-e1c59.appspot.com",
  messagingSenderId: "1090684076393",
  appId: "1:1090684076393:web:d4e2c8e9e9e9e9e9e9e9e9"
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