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
  await deleteDoc(doc(db, 'users', uid));
};

export const getUserById = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await getDocs(collection(db, 'users'));
  const userDoc = snapshot.docs.find(docSnap => docSnap.id === uid || docSnap.data().uid === uid);
  return userDoc ? (userDoc.data() as UserProfile) : null;
}; 