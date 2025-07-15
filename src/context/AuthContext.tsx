import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { signInWithGoogle, signInWithGoogleRedirect, getGoogleRedirectResult } from '../services/google';
import { 
  sendWelcomeEmail, 
  sendLoginNotificationEmail, 
  sendAccountDeletionEmail,
  sendPasswordResetEmail 
} from '../services/email';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  college: string;
  semester: string;
  course: string;
  role: 'student' | 'admin';
  createdAt: Date;
  avatar?: string; // legacy avatar URL
  avatarOriginal?: string;
  avatarCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  } | null;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  loginWithGoogleRedirect: () => void;
  checkGoogleRedirect: () => Promise<User | null>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        setUserProfile(JSON.parse(cached));
        setLoading(false);
      } catch {}
    }
    // Continue with auth state listener
  }, []);

  // Save userProfile to localStorage whenever it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [userProfile]);

  const register = async (email: string, password: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: profile.name
      });

      // Create user profile in Firestore
      const userProfileData: UserProfile = {
        ...profile,
        uid: user.uid,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfileData);
      setUserProfile(userProfileData);
      
      // Send welcome email with account details
      await sendWelcomeEmail(userProfileData, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error?.message || 'An unexpected error occurred.');
    }
  };

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userProfile = userDoc.data() as UserProfile;
        
        // Send login notification email
        await sendLoginNotificationEmail(userProfile, {
          time: new Date(),
          // You could add more details like IP, device, etc. using a third-party service
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error?.message || 'An unexpected error occurred.');
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    try {
      const user = await signInWithGoogle();
      
      // Check if this is a new user (first login)
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Existing user - send login notification
        await sendLoginNotificationEmail(userSnap.data() as UserProfile, {
          time: new Date(),
        });
      } else {
        // New user - this should be handled in the Google service
        // The welcome email is sent there after creating the profile
      }
      
      return user;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error?.message || 'An unexpected error occurred during Google login.');
    }
  };

  const loginWithGoogleRedirect = () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    signInWithGoogleRedirect();
  };

  const checkGoogleRedirect = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    try {
      return await getGoogleRedirectResult();
    } catch (error: any) {
      console.error('Google redirect result error:', error);
      throw new Error(error?.message || 'An unexpected error occurred processing Google sign-in.');
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }

    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, profile, { merge: true });
      
      if (userProfile) {
        setUserProfile({ ...userProfile, ...profile });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };
  
  const deleteAccount = async () => {
    if (!currentUser || !userProfile) return;
    
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    try {
      // Store user information before deletion
      const { email, name } = userProfile;
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      
      // Delete user authentication
      await deleteUser(currentUser);
      
      // Send account deletion confirmation email
      await sendAccountDeletionEmail(email, name);
      
      // Clear local state
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    try {
      // Firebase will send an email with a password reset link
      await firebaseSendPasswordResetEmail(auth, email);
      
      // We can also send our custom email with the same link
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      };
      
      const resetLink = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail(email, resetLink);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase is not properly configured. Authentication features will not work.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    loginWithGoogleRedirect,
    checkGoogleRedirect,
    logout,
    updateUserProfile,
    deleteAccount,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 