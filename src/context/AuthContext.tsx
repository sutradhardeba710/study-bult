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
  sendAccountDeletionEmail
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

// Define the Google auth result type
export interface GoogleAuthResult {
  user: User;
  profile: UserProfile;
  isNewUser: boolean;
  isProfileComplete: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<GoogleAuthResult>;
  loginWithGoogleRedirect: () => void;
  checkGoogleRedirect: () => Promise<GoogleAuthResult | null>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserProfileAfterGoogleSignIn: (profile: UserProfile, updatedFields: Partial<UserProfile>) => Promise<UserProfile>;
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
      } catch (error) {
        console.error('Error parsing cached user profile:', error);
        localStorage.removeItem('userProfile');
      }
    }
    // Auth state listener is set up in another useEffect
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
      
      // Send welcome email
      await sendWelcomeEmail(userProfileData);
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
      const result = await signInWithGoogle();
      
      // Check if this is a new user or if profile is incomplete
      if (result.isNewUser || !result.isProfileComplete) {
        // For new users, the profile is already created in the Google service
        return result;
      } else {
        // Existing user with complete profile - send login notification
        await sendLoginNotificationEmail(result.profile, {
          time: new Date(),
        });
        return result;
      }
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
      // FIXED: Custom email removed - it was sending incorrect reset link
      // Firebase's email contains the correct action code for password reset
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Add this function to update user profile and send welcome email
  const updateUserProfileAfterGoogleSignIn = async (profile: UserProfile, updatedFields: Partial<UserProfile>) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    
    try {
      const userRef = doc(db, 'users', profile.uid);
      
      // Update the profile with the provided fields
      const updatedProfile = { ...profile, ...updatedFields };
      await setDoc(userRef, updatedProfile, { merge: true });
      
      // Send welcome email only after profile is completed
      if (profile.email) {
        await sendWelcomeEmail(updatedProfile);
      }
      
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile after Google sign-in:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase is not properly configured. Authentication features will not work.');
      setLoading(false);
      return;
    }

    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            console.log('User profile loaded from Firestore');
            setUserProfile(profileData);
            // Update localStorage
            localStorage.setItem('userProfile', JSON.stringify(profileData));
          } else {
            console.warn('User authenticated but no profile found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('userProfile');
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
    updateUserProfileAfterGoogleSignIn, // Add this to the context value
    deleteAccount,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 