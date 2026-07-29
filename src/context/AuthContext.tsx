/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
// engagement is imported lazily inside onAuthStateChanged — never parsed for guests
import { isFirebaseConfigured, initFirebaseAuth } from '../services/firebase';
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
    xp?: number;
    streak?: number;
    lastActiveDate?: string;
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
    loginWithGoogleRedirect: () => Promise<void>;
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
            const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            const auth = await initFirebaseAuth();

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await updateProfile(user, {
                displayName: profile.name
            });

            // Create user profile in Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');
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
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const auth = await initFirebaseAuth();

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');

            // Get user profile
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const profile = userDoc.data() as UserProfile;
                // ✅ Set profile immediately so UI updates right after login
                setUserProfile(profile);

                // Send login notification email (fire-and-forget)
                sendLoginNotificationEmail(profile, { time: new Date() }).catch(() => { });
            }
        } catch (error: any) {
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
            // Removed console.error as per user request
            throw new Error(error?.message || 'An unexpected error occurred during Google login.');
        }
    };

    const loginWithGoogleRedirect = async () => {
        if (!isFirebaseConfigured) {
            throw new Error('Firebase is not properly configured. Please check your environment variables.');
        }

        await signInWithGoogleRedirect();
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
            const { signOut } = await import('firebase/auth');
            const auth = await initFirebaseAuth();

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
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');
            const userRef = doc(db, 'users', currentUser.uid);

            // Sanitize the profile object to remove undefined values
            const sanitizedProfile = Object.entries(profile).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    (acc as any)[key] = value;
                }
                return acc;
            }, {} as Partial<UserProfile>);

            await setDoc(userRef, sanitizedProfile, { merge: true });

            if (userProfile) {
                setUserProfile({ ...userProfile, ...sanitizedProfile });
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

            const { doc, deleteDoc } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');

            // Delete user data from Firestore
            await deleteDoc(doc(db, 'users', currentUser.uid));

            // Delete user authentication
            const { deleteUser } = await import('firebase/auth');
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
            const { sendPasswordResetEmail: firebaseSendPasswordResetEmail } = await import('firebase/auth');
            const auth = await initFirebaseAuth();

            // Firebase will send an email with a password reset link
            await firebaseSendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    };

    const updateUserProfileAfterGoogleSignIn = async (profile: UserProfile, updatedFields: Partial<UserProfile>) => {
        if (!isFirebaseConfigured) {
            throw new Error('Firebase is not properly configured. Please check your environment variables.');
        }

        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../services/firebaseDb');
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

        let unsubscribe: (() => void) | undefined;

        // Start Firebase auth lazily to avoid blocking first paint.
        // Waiting 500ms gives the UI plenty of time to render the 'loading/guest' skeleton.
        const startAuth = async () => {
            const { onAuthStateChanged } = await import('firebase/auth');
            const auth = await initFirebaseAuth();

            unsubscribe = onAuthStateChanged(auth, async (user) => {
                setCurrentUser(user);

                if (user) {
                    // Fetch user profile from Firestore
                    try {
                        const { doc, getDoc } = await import('firebase/firestore');
                        const { db } = await import('../services/firebaseDb');
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists()) {
                            let profileData = userDoc.data() as UserProfile;
                            // Lazy-import engagement so guests never parse this module
                            try {
                                const { updateStreakAndXP } = await import('../services/engagement');
                                const { streak, xp } = await updateStreakAndXP(user.uid);
                                profileData = { ...profileData, streak, xp };
                            } catch (engErr) {
                                console.warn('[engagement] streak update skipped:', engErr);
                            }
                            setUserProfile(profileData);
                            // Update localStorage
                            localStorage.setItem('userProfile', JSON.stringify(profileData));
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
        };

        // Start auth during browser idle time to avoid blocking paint/LCP.
        // requestIdleCallback fires after layout/paint is done (or after 800ms max).
        // Safari doesn't support rIC, so we use a 200ms setTimeout fallback.
        let timerId: ReturnType<typeof setTimeout> | undefined;
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(startAuth, { timeout: 800 });
        } else {
            timerId = setTimeout(startAuth, 200);
        }

        return () => {
            if (timerId) clearTimeout(timerId);
            if (unsubscribe) unsubscribe();
        };
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
        updateUserProfileAfterGoogleSignIn,
        deleteAccount,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};