import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import type { UserProfile } from '../context/AuthContext';

// Add custom parameters to Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Check if user profile has required fields
export const isProfileComplete = (profile: UserProfile): boolean => {
  return !!(profile.college && profile.semester && profile.course);
};

// Sign in with Google using Popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    // If user doesn't exist, create a temporary profile
    if (!userSnap.exists()) {
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        college: '',
        semester: '',
        course: '',
        role: 'student' as const,
        createdAt: new Date(),
        avatar: user.photoURL || undefined
      };
      
      // Create a temporary profile - we'll only send the welcome email
      // after the profile is completed
      await setDoc(userRef, newUserProfile);
      
      return {
        user,
        profile: newUserProfile,
        isNewUser: true,
        isProfileComplete: false
      };
    } else {
      // Existing user
      const profile = userSnap.data() as UserProfile;
      const profileComplete = isProfileComplete(profile);
      
      // If the profile is complete, send a login notification
      if (profileComplete) {
        // We'll handle the login notification in the AuthContext
      }
      
      return {
        user,
        profile,
        isNewUser: false,
        isProfileComplete: profileComplete
      };
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign in with Google using Redirect
export const signInWithGoogleRedirect = () => {
  signInWithRedirect(auth, googleProvider);
};

// Get the result of the redirect sign-in
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      // If user doesn't exist, create a temporary profile
      if (!userSnap.exists()) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          college: '',
          semester: '',
          course: '',
          role: 'student' as const,
          createdAt: new Date(),
          avatar: user.photoURL || undefined
        };
        
        // Create a temporary profile - we'll only send the welcome email
        // after the profile is completed
        await setDoc(userRef, newUserProfile);
        
        return {
          user,
          profile: newUserProfile,
          isNewUser: true,
          isProfileComplete: false
        };
      } else {
        // Existing user
        const profile = userSnap.data() as UserProfile;
        const profileComplete = isProfileComplete(profile);
        
        // If the profile is complete, send a login notification
        if (profileComplete) {
          // We'll handle the login notification in the AuthContext
        }
        
        return {
          user,
          profile,
          isNewUser: false,
          isProfileComplete: profileComplete
        };
      }
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

// Type declaration for global window object
declare global {
  interface Window {
    google?: any;
    grecaptcha?: any;
  }
} 