import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export type MetaType = 'subjects' | 'semesters' | 'courses' | 'colleges' | 'examTypes';

export interface MetaItem {
  id?: string;
  name: string;
  category?: string;
  description?: string;
  order?: number;
  status?: 'pending' | 'approved';
  createdBy?: string;
}

export const getMetaItems = async (type: MetaType): Promise<MetaItem[]> => {
  // Fetch all items without ordering first to ensure we get items that don't have the 'order' field yet
  // Firestore's orderBy filters out documents where the field is missing, which caused old items to disappear
  try {
    const snapshot = await getDocs(collection(db, type));
    const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as MetaItem));

    // Sort client-side
    return items.sort((a, b) => {
      // Items without order go to the end
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  } catch (error) {
    console.error('Error fetching meta items:', error);
    // Return empty array or throw depending on needs, but let's try to return what we can
    return [];
  }
};

export const addMetaItem = async (
  type: MetaType,
  name: string,
  category?: string,
  userId?: string,
  isAdmin?: boolean
): Promise<string> => {
  // Get current max order to append to the end
  const items = await getMetaItems(type);
  // Filter out the MAX_SAFE_INTEGER items for calculation
  const orderedItems = items.filter(i => i.order !== undefined && i.order < Number.MAX_SAFE_INTEGER);
  const maxOrder = orderedItems.length > 0 ? Math.max(...orderedItems.map(i => i.order || 0)) : 0;

  const status = isAdmin ? 'approved' : 'pending';

  const docRef = await addDoc(collection(db, type), {
    name,
    ...(category && { category }),
    order: maxOrder + 1,
    status,
    ...(userId && { createdBy: userId })
  });
  return docRef.id;
};

export const updateMetaItem = async (type: MetaType, id: string, name: string, description?: string, category?: string): Promise<void> => {
  await updateDoc(doc(db, type, id), {
    name,
    ...(description !== undefined && { description }),
    ...(category !== undefined && { category })
  });
};

export const approveMetaItem = async (type: MetaType, id: string): Promise<void> => {
  await updateDoc(doc(db, type, id), {
    status: 'approved'
  });
};

export const deleteMetaItem = async (type: MetaType, id: string): Promise<void> => {
  await deleteDoc(doc(db, type, id));
};

export const reorderMetaItems = async (type: MetaType, items: MetaItem[]): Promise<void> => {
  const batch = writeBatch(db);

  items.forEach((item, index) => {
    if (!item.id) return;
    const ref = doc(db, type, item.id);
    batch.update(ref, { order: index });
  });

  await batch.commit();
};