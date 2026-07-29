import { db } from './firebaseDb';
import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    deleteDoc,
    updateDoc,
    where
} from 'firebase/firestore';

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read';
    createdAt: any;
}

const COLLECTION_NAME = 'contact_messages';

export const getContactMessages = async () => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ContactMessage[];
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        throw error;
    }
};

export const markMessageAsRead = async (id: string) => {
    const messageRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(messageRef, { status: 'read' });
};

export const deleteMessage = async (id: string) => {
    const messageRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(messageRef);
};

export const getUnreadMessagesCount = async () => {
    const q = query(collection(db, COLLECTION_NAME), where('status', '==', 'unread'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
};
