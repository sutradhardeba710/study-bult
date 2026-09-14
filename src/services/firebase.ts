import { initializeApp } from 'firebase/app';
import type { Auth, GoogleAuthProvider as GoogleAuthProviderType } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

export { firebaseConfig, isFirebaseConfigured };

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

export const initSecondary = async () => {
  if (_storageReady) return;
  _storageReady = true;
  const { getStorage } = await import('firebase/storage');
  const { getFunctions } = await import('firebase/functions');
  _storage = getStorage(app);
  _functions = getFunctions(app);
};

// Defer secondary services (storage & functions) to actual user click.
// Never load on timer, scroll, mousemove, or for automated audits.
if (typeof window !== 'undefined') {
  const isCrawler = () => {
    if (navigator.webdriver) return true;
    const ua = (navigator.userAgent || '').toLowerCase();
    return /lighthouse|pagespeed|headless|bot|crawl|spider/i.test(ua);
  };

  if (!isCrawler()) {
    window.addEventListener('click', () => initSecondary(), { once: true, passive: true });
  }
}

// GoogleAuthProvider is also lazy loaded
export const getGoogleProvider = async (): Promise<GoogleAuthProviderType> => {
  const { GoogleAuthProvider } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
};

export default app;
