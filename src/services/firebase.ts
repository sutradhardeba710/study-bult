import { initializeApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider as GoogleAuthProviderType } from 'firebase/auth';

// Helper to get environment variables in both Vite and Node environments
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return process.env[key];
};

// Your Firebase configuration
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

  return !hasPlaceholders && !missingRequiredFields;
};

// Initialize Firebase — core app (no network calls, just config)
const app = initializeApp(firebaseConfig);

// Auth is lazy-loaded to prevent blocking the initial paint with the heavy 
// firebase/auth bundle and the hidden iframe it creates to sync cross-origin state.
export let auth = {} as Auth;
let _authReady = false;

export const initFirebaseAuth = async (): Promise<Auth> => {
  if (_authReady) return auth;
  const { getAuth, setPersistence, browserLocalPersistence } = await import('firebase/auth');
  auth = getAuth(app);
  _authReady = true;
  await setPersistence(auth, browserLocalPersistence).catch(() => { /* ignore */ });
  return auth;
};

// Storage and Functions — deferred until first user interaction or 4s timeout.
// These are dynamically imported so their SDK code is never in the critical bundle.
let _storageReady = false;
let _storage: any = {};
let _functions: any = {};

export const getStorageInstance = () => _storage;
export const getFunctionsInstance = () => _functions;

// Keep backward-compatible `storage` and `functions` exports as getters
// that return the lazily-initialized instances.
export { _storage as storage, _functions as functions };

const initSecondary = async () => {
  if (_storageReady) return;
  _storageReady = true;
  const { getStorage } = await import('firebase/storage');
  const { getFunctions } = await import('firebase/functions');
  _storage = getStorage(app);
  _functions = getFunctions(app);
};

// Initialise on first user interaction OR after 4 seconds — whichever comes first.
if (typeof window !== 'undefined') {
  const events = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'];
  const onInteraction = () => {
    initSecondary();
    events.forEach(e => window.removeEventListener(e, onInteraction));
  };
  events.forEach(e => window.addEventListener(e, onInteraction, { once: true, passive: true }));
  setTimeout(initSecondary, 4000);
}

// GoogleAuthProvider is also lazy loaded
export const getGoogleProvider = async (): Promise<GoogleAuthProviderType> => {
  const { GoogleAuthProvider } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
};

// Export config validation
export const isFirebaseConfigured = isConfigValid();

export default app;
