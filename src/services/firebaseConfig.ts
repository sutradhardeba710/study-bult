// Pure configuration module with zero dependencies
// Prevents importing `firebase/app` on pages and components that only need to check configuration status.

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return process.env[key];
};

export const firebaseConfig: { [key: string]: any } = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || "your-api-key",
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || "your-project.firebaseapp.com",
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || "your-project-id",
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || "your-project.appspot.com",
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "your-sender-id",
  appId: getEnv('VITE_FIREBASE_APP_ID') || "your-app-id"
};

const hasPlaceholders = Object.values(firebaseConfig).some(
  value => typeof value === 'string' && (
    value.includes('your-') ||
    value === 'undefined' ||
    value.length < 5
  )
);

const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingRequiredFields = requiredFields.some(
  field => !firebaseConfig[field] ||
    typeof firebaseConfig[field] !== 'string' ||
    firebaseConfig[field].includes('your-')
);

export const isFirebaseConfigured = !hasPlaceholders && !missingRequiredFields;
