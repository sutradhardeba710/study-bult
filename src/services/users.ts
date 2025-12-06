import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    college: string;
    semester: string;
    course: string;
    role: 'student' | 'admin';
    createdAt: any;
    avatarOriginal?: string;
    avatarCrop?: {
        x: number;
        y: number;
        width: number;
        height: number;
        zoom: number;
    };
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(docSnap => docSnap.data() as UserProfile);
};

export const updateUser = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await updateDoc(doc(db, 'users', uid), data);
};

export const deleteUser = async (uid: string): Promise<void> => {
    // Try to delete using Cloud Function (deletes both auth + Firestore)
    try {
        const { httpsCallable } = await import('firebase/functions');
        const { functions } = await import('./firebase');
        if (!functions) throw { code: 'unavailable' };
        const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');

        console.log('🔄 Calling Cloud Function to delete user:', uid);
        const result = await deleteAuthUser({ uid });
        console.log('✅ User deleted via Cloud Function:', result.data);
        return;
    } catch (error: any) {
        console.error('❌ Cloud Function deletion failed:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
        console.error('Full error:', error);

        // If Cloud Function fails (not deployed, network error, etc.),
        // fall back to Firestore-only deletion
        // Note: This will leave orphaned auth accounts
        if (error?.code === 'functions/not-found' || error?.code === 'unavailable') {
            console.warn('⚠️ Cloud Function not found. Deleting Firestore document only.');
            console.warn('⚠️ Auth account will remain - manual cleanup required.');
        }

        // Fall back to Firestore-only deletion
        console.log('🔄 Falling back to Firestore-only deletion...');
        await deleteDoc(doc(db, 'users', uid));
        console.log('✅ Firestore document deleted (Auth account remains)');
    }
};

export const getUserById = async (uid: string): Promise<UserProfile | null> => {
    const snapshot = await getDocs(collection(db, 'users'));
    const userDoc = snapshot.docs.find(docSnap => docSnap.id === uid || docSnap.data().uid === uid);
    return userDoc ? (userDoc.data() as UserProfile) : null;
};