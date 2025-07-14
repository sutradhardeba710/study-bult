import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Google Authentication Provider
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google using Popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    // If user doesn't exist, create a new profile
    if (!userSnap.exists()) {
      const newUserProfile = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        college: '',
        semester: '',
        course: '',
        role: 'student',
        createdAt: new Date(),
        avatar: user.photoURL || undefined
      };
      
      await setDoc(userRef, newUserProfile);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign in with Google using Redirect (better for mobile)
export const signInWithGoogleRedirect = () => {
  return signInWithRedirect(auth, googleProvider);
};

// Get the result from redirect sign-in
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      // If user doesn't exist, create a new profile
      if (!userSnap.exists()) {
        const newUserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          college: '',
          semester: '',
          course: '',
          role: 'student',
          createdAt: new Date(),
          avatar: user.photoURL || undefined
        };
        
        await setDoc(userRef, newUserProfile);
      }
      
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error getting redirect result:', error);
    throw error;
  }
};

// Google Analytics (placeholder - you'll need to set up gtag.js)
export const initGoogleAnalytics = (measurementId: string) => {
  // This would typically be done in a script tag in index.html
  // or by importing a separate analytics library
  console.log(`Google Analytics initialized with ID: ${measurementId}`);
};

// Google Maps API (placeholder)
export const loadGoogleMaps = (apiKey: string) => {
  return new Promise<void>((resolve, reject) => {
    // Check if Maps API is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
};

// Google reCAPTCHA (placeholder)
export const initRecaptcha = (siteKey: string) => {
  return new Promise<void>((resolve, reject) => {
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    
    document.head.appendChild(script);
  });
};

// Execute reCAPTCHA verification
export const executeRecaptcha = (siteKey: string, action: string) => {
  return new Promise<string>((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }
    
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
};

// Google Drive API integration (placeholder)
export const initGoogleDrive = () => {
  // This would typically be implemented with the Google Drive API client library
  console.log('Google Drive API integration initialized');
};

// Google Search Console verification
export const addSearchConsoleVerification = (verificationId: string) => {
  // Check if meta tag already exists
  const existingTag = document.querySelector('meta[name="google-site-verification"]');
  if (existingTag) {
    // Update existing tag
    existingTag.setAttribute('content', verificationId);
    return;
  }
  
  // Create meta tag for Google Search Console verification
  const metaTag = document.createElement('meta');
  metaTag.name = 'google-site-verification';
  metaTag.content = verificationId;
  document.head.appendChild(metaTag);
  
  console.log('Google Search Console verification meta tag added');
};

// Generate sitemap.xml content
export const generateSitemap = (baseUrl: string, routes: string[]) => {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${route}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  return sitemap;
};

// Type declaration for global window object
declare global {
  interface Window {
    google?: any;
    grecaptcha?: any;
  }
} 