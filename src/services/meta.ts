import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export type MetaType = 'subjects' | 'semesters' | 'courses' | 'colleges' | 'examTypes';

export interface MetaItem {
  id?: string;
  name: string;
  description?: string;
}

export const getMetaItems = async (type: MetaType): Promise<MetaItem[]> => {
  const snapshot = await getDocs(collection(db, type));
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as MetaItem));
};

export const addMetaItem = async (type: MetaType, name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, type), { name });
  return docRef.id;
};

export const updateMetaItem = async (type: MetaType, id: string, name: string, description?: string): Promise<void> => {
  await updateDoc(doc(db, type, id), { name, ...(description !== undefined && { description }) });
};

export const deleteMetaItem = async (type: MetaType, id: string): Promise<void> => {
  await deleteDoc(doc(db, type, id));
}; 