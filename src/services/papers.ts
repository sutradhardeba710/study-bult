import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { db } from './firebaseDb';
import type { PaperData } from './upload';
import logger from '../utils/logger';
import { awardXP } from './engagement';

export interface PaperFilter {
  college?: string;
  semester?: string;
  course?: string;
  subject?: string;
  examType?: string;
  status?: 'pending' | 'approved' | 'rejected';
  uploaderId?: string;
}

export const getPapers = async (filters: PaperFilter = {}, limitCount: number = 20): Promise<PaperData[]> => {
  try {
    const q = collection(db, 'papers');
    const constraints: any[] = [];

    // Apply filters
    if (filters.college) {
      constraints.push(where('college', '==', filters.college));
    }
    if (filters.semester) {
      constraints.push(where('semester', '==', filters.semester));
    }
    if (filters.course) {
      constraints.push(where('course', '==', filters.course));
    }
    if (filters.subject) {
      constraints.push(where('subject', '==', filters.subject));
    }
    if (filters.examType) {
      constraints.push(where('examType', '==', filters.examType));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.uploaderId) {
      constraints.push(where('uploaderId', '==', filters.uploaderId));
    }

    // Order by creation date (newest first)
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    const papersQuery = query(q, ...constraints);
    const querySnapshot = await getDocs(papersQuery);

    const papers: PaperData[] = [];
    querySnapshot.forEach((doc) => {
      papers.push({ id: doc.id, ...doc.data() } as PaperData & { id: string });
    });

    return papers;
  } catch (error) {
    logger.error('Error fetching papers:', error);
    throw error;
  }
};

export const getPaperById = async (paperId: string): Promise<PaperData | null> => {
  try {
    const paperDoc = await getDoc(doc(db, 'papers', paperId));
    if (paperDoc.exists()) {
      return { id: paperDoc.id, ...paperDoc.data() } as PaperData & { id: string };
    }
    return null;
  } catch (error) {
    logger.error('Error fetching paper:', error);
    throw error;
  }
};

export const getUserPapers = async (userId: string): Promise<PaperData[]> => {
  try {
    logger.debug('Fetching papers for user', { userId: userId.substring(0, 4) + '...' });

    // Temporarily removed orderBy to fix BloomFilter error
    // Add back once index is created: orderBy('createdAt', 'desc')
    const q = query(
      collection(db, 'papers'),
      where('uploaderId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const papers: PaperData[] = [];
    querySnapshot.forEach((doc) => {
      papers.push({ id: doc.id, ...doc.data() } as PaperData & { id: string });
    });

    papers.sort((a, b) => {
      const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt as string | number);
      const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt as string | number);
      return dateB.getTime() - dateA.getTime();
    });

    logger.debug('Papers fetched successfully', { count: papers.length });
    return papers;
  } catch (error) {
    logger.error('Error in getUserPapers', error);
    throw error;
  }
};

export const getLikedPapers = async (userId: string): Promise<PaperData[]> => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('userId', '==', userId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    const paperIds = likesSnapshot.docs.map(doc => doc.data().paperId).filter(Boolean);
    if (paperIds.length === 0) return [];
    // ✅ Single batch fetch instead of N+1 serial reads
    const papersMap = await getPapersByIds(paperIds);
    return paperIds.map(id => papersMap[id]).filter(Boolean) as PaperData[];
  } catch (error) {
    logger.error('Error fetching liked papers:', error);
    throw error;
  }
};

export const likePaper = async (paperId: string, userId: string): Promise<void> => {
  try {
    // Add to likes collection
    await addDoc(collection(db, 'likes'), {
      paperId,
      userId,
      createdAt: new Date()
    });

    // Increment like count on paper
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      likeCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Award XP to the uploader (+3 per like)
    const paperSnap = await getDoc(paperRef);
    if (paperSnap.exists()) {
      const uploaderId: string | undefined = paperSnap.data().uploaderId;
      if (uploaderId && uploaderId !== userId) {
        awardXP(uploaderId, 3); // fire-and-forget
      }
    }
  } catch (error) {
    logger.error('Error liking paper:', error);
    throw error;
  }
};

export const unlikePaper = async (paperId: string, userId: string): Promise<void> => {
  try {
    // Remove from likes collection
    const likesQuery = query(
      collection(db, 'likes'),
      where('paperId', '==', paperId),
      where('userId', '==', userId)
    );
    const likesSnapshot = await getDocs(likesQuery);

    if (!likesSnapshot.empty) {
      await deleteDoc(likesSnapshot.docs[0].ref);
    }

    // Decrement like count on paper
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      likeCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error unliking paper:', error);
    throw error;
  }
};

export const isPaperLiked = async (paperId: string, userId: string): Promise<boolean> => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('paperId', '==', paperId),
      where('userId', '==', userId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    return !likesSnapshot.empty;
  } catch (error) {
    logger.error('Error checking if paper is liked:', error);
    return false;
  }
};

/**
 * Fetches ALL liked paper IDs for a user in a single Firestore query.
 * Use this instead of calling isPaperLiked() in a loop.
 */
export const getUserLikedPaperIds = async (userId: string): Promise<Set<string>> => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(likesQuery);
    const ids = new Set<string>();
    snapshot.forEach(docSnap => {
      const paperId = docSnap.data().paperId;
      if (paperId) ids.add(paperId);
    });
    return ids;
  } catch (error) {
    logger.error('Error fetching liked paper IDs:', error);
    return new Set();
  }
};

// Download tracking functions
export const addDownload = async (paperId: string, userId: string): Promise<void> => {
  try {
    // Add to downloads collection
    await addDoc(collection(db, 'downloads'), {
      paperId,
      userId,
      createdAt: serverTimestamp()
    });

    // Increment download count on paper
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      downloadCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Award XP to the uploader (+5 per download)
    const paperSnap = await getDoc(paperRef);
    if (paperSnap.exists()) {
      const uploaderId: string | undefined = paperSnap.data().uploaderId;
      if (uploaderId && uploaderId !== userId) {
        awardXP(uploaderId, 5); // fire-and-forget
      }
    }
  } catch (error) {
    logger.error('Error adding download:', error);
    throw error;
  }
};

export const getUserDownloads = async (userId: string): Promise<PaperData[]> => {
  try {
    const downloadsQuery = query(
      collection(db, 'downloads'),
      where('userId', '==', userId)
    );
    const downloadsSnapshot = await getDocs(downloadsQuery);

    const paperIds = downloadsSnapshot.docs.map(doc => doc.data().paperId).filter(Boolean);
    if (paperIds.length === 0) return [];

    // ✅ Single batch fetch instead of N+1 serial reads
    const papersMap = await getPapersByIds(paperIds);
    return paperIds.map(id => papersMap[id]).filter(Boolean) as PaperData[];
  } catch (error) {
    logger.error('Error fetching user downloads:', error);
    throw error;
  }
};

export const getDownloadDate = async (paperId: string, userId: string): Promise<Date | null> => {
  try {
    const downloadsQuery = query(
      collection(db, 'downloads'),
      where('paperId', '==', paperId),
      where('userId', '==', userId)
    );
    const downloadsSnapshot = await getDocs(downloadsQuery);

    if (!downloadsSnapshot.empty) {
      const downloadData = downloadsSnapshot.docs[0].data();
      return downloadData.createdAt?.toDate() || null;
    }

    return null;
  } catch (error) {
    logger.error('Error getting download date:', error);
    return null;
  }
};

export const deletePaper = async (paperId: string): Promise<void> => {
  try {
    // Get the paper document first to find the file paths
    const paperRef = doc(db, 'papers', paperId);
    const paperDoc = await getDoc(paperRef);

    if (!paperDoc.exists()) {
      logger.warn('Paper not found for deletion:', paperId);
      throw new Error('Paper not found');
    }

    const data = paperDoc.data();

    // 1. Delete the main PDF file from storage
    if (data.storagePath) {
      try {
        const fileRef = ref(storage, data.storagePath);
        await deleteObject(fileRef);
        logger.debug('Main PDF file deleted from storage:', data.storagePath);
      } catch (storageError: any) {
        logger.warn('Error deleting main PDF from storage:', storageError?.message || storageError);
        // Continue even if storage deletion fails
      }
    }

    // 2. Delete thumbnail if thumbnailUrl exists
    if (data.thumbnailUrl) {
      try {
        const urlMatch = data.thumbnailUrl.match(/\/o\/(.+?)\?/);
        if (urlMatch && urlMatch[1]) {
          const thumbnailPath = decodeURIComponent(urlMatch[1]);
          const thumbnailRef = ref(storage, thumbnailPath);
          await deleteObject(thumbnailRef);
          logger.debug('Thumbnail deleted from storage:', thumbnailPath);
        }
      } catch (storageError: any) {
        logger.warn('Error deleting thumbnail:', storageError?.message || storageError);
      }
    }

    // 3. Delete all associated likes from Firestore
    try {
      const likesQuery = query(
        collection(db, 'likes'),
        where('paperId', '==', paperId)
      );
      const likesSnapshot = await getDocs(likesQuery);
      const likeDeletions = likesSnapshot.docs.map(likeDoc => deleteDoc(likeDoc.ref));
      await Promise.all(likeDeletions);
      logger.debug(`Deleted ${likeDeletions.length} likes for paper:`, paperId);
    } catch (error: any) {
      logger.warn('Error deleting likes:', error?.message || error);
    }

    // 4. Delete all associated downloads from Firestore
    try {
      const downloadsQuery = query(
        collection(db, 'downloads'),
        where('paperId', '==', paperId)
      );
      const downloadsSnapshot = await getDocs(downloadsQuery);
      const downloadDeletions = downloadsSnapshot.docs.map(downloadDoc => deleteDoc(downloadDoc.ref));
      await Promise.all(downloadDeletions);
      logger.debug(`Deleted ${downloadDeletions.length} downloads for paper:`, paperId);
    } catch (error: any) {
      logger.warn('Error deleting downloads:', error?.message || error);
    }

    // 5. Finally, delete the paper document from Firestore
    await deleteDoc(paperRef);
    logger.debug('Paper document deleted from Firestore:', paperId);
    logger.info(`Paper ${paperId} and all associated data successfully deleted`);
  } catch (error) {
    logger.error('Error deleting paper:', error);
    throw error;
  }
};

export const approvePaper = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, { status: 'approved' });
  } catch (error) {
    logger.error('Error approving paper:', error);
    throw error;
  }
};

export const rejectPaper = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, { status: 'rejected' });
  } catch (error) {
    logger.error('Error rejecting paper:', error);
    throw error;
  }
};

export const deletePaperById = async (paperId: string): Promise<void> => {
  // Reuse the main delete function to ensure consistency
  return deletePaper(paperId);
};

export const getPapersCount = async (): Promise<number> => {
  // ✅ getCountFromServer fetches only the count — no documents downloaded
  const snapshot = await getCountFromServer(collection(db, 'papers'));
  return snapshot.data().count;
};

export const getPendingPapersCount = async (): Promise<number> => {
  const q = query(collection(db, 'papers'), where('status', '==', 'pending'));
  // ✅ getCountFromServer fetches only the count — no documents downloaded
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

// Fetch like events for a user (for activity log)
export const getUserLikeEvents = async (userId: string): Promise<Array<{ paperId: string, title: string, date: any }>> => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('userId', '==', userId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    const likeDocs = likesSnapshot.docs.map(docSnap => docSnap.data());
    const paperIds = likeDocs.map(data => data.paperId).filter(Boolean);
    const paperMap = await getPapersByIds(paperIds);
    const likeEvents: Array<{ paperId: string, title: string, date: any }> = [];
    for (const data of likeDocs) {
      const paperId = data.paperId;
      const date = data.createdAt;
      const paper = paperMap[paperId];
      if (paper) {
        likeEvents.push({ paperId, title: paper.title, date });
      }
    }
    return likeEvents;
  } catch (error) {
    logger.error('Error fetching like events:', error);
    throw error;
  }
};

// Batch fetch papers by IDs (handles Firestore 10 'in' limit)
export const getPapersByIds = async (paperIds: string[]): Promise<Record<string, PaperData>> => {
  const result: Record<string, PaperData> = {};
  const chunkSize = 10;
  for (let i = 0; i < paperIds.length; i += chunkSize) {
    const chunk = paperIds.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    const q = query(collection(db, 'papers'), where('__name__', 'in', chunk));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      result[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as PaperData & { id: string };
    });
  }
  return result;
};

export const updatePaper = async (paperId: string, data: Partial<PaperData>): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.error('Error updating paper:', error);
    throw error;
  }
};

export const getPaperLikes = async (paperId: string): Promise<Array<{ userId: string, createdAt: any }>> => {
  const likesQuery = query(
    collection(db, 'likes'),
    where('paperId', '==', paperId)
  );
  const likesSnapshot = await getDocs(likesQuery);
  return likesSnapshot.docs.map(doc => {
    const data = doc.data();
    return { userId: data.userId, createdAt: data.createdAt };
  });
};

export const getPaperDownloads = async (paperId: string): Promise<Array<{ userId: string, createdAt: any }>> => {
  const downloadsQuery = query(
    collection(db, 'downloads'),
    where('paperId', '==', paperId)
  );
  const downloadsSnapshot = await getDocs(downloadsQuery);
  return downloadsSnapshot.docs.map(doc => {
    const data = doc.data();
    return { userId: data.userId, createdAt: data.createdAt };
  });
};

/**
 * Returns the most-downloaded approved paper from the last 7 days.
 * Falls back to the overall most-downloaded approved paper if no recent ones exist.
 */
export const getPaperOfTheWeek = async (): Promise<PaperData | null> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Try recent papers first
    const recentQuery = query(
      collection(db, 'papers'),
      where('status', '==', 'approved'),
      where('createdAt', '>=', sevenDaysAgo),
      orderBy('createdAt', 'desc'),
      orderBy('downloadCount', 'desc'),
      limit(1)
    );
    const recentSnap = await getDocs(recentQuery);
    if (!recentSnap.empty) {
      const d = recentSnap.docs[0];
      return { id: d.id, ...d.data() } as PaperData & { id: string };
    }

    // Fallback: all-time most downloaded approved paper
    const fallbackQuery = query(
      collection(db, 'papers'),
      where('status', '==', 'approved'),
      orderBy('downloadCount', 'desc'),
      limit(1)
    );
    const fallbackSnap = await getDocs(fallbackQuery);
    if (!fallbackSnap.empty) {
      const d = fallbackSnap.docs[0];
      return { id: d.id, ...d.data() } as PaperData & { id: string };
    }
    return null;
  } catch (error) {
    logger.error('Error fetching paper of the week:', error);
    return null;
  }
};

/**
 * Returns the list of distinct subjects that have at least one approved paper
 * for the given college + semester. Uses only a single where() to avoid
 * requiring a Firestore composite index.
 */
export const getSubjectCoverage = async (college: string, semester: string): Promise<string[]> => {
  try {
    // Single where clause → no composite index needed
    const q = query(
      collection(db, 'papers'),
      where('college', '==', college),
    );
    const snap = await getDocs(q);
    const subjects = new Set<string>();
    snap.forEach(d => {
      const data = d.data();
      // Filter status and semester client-side
      if (data.status === 'approved' && data.semester === semester) {
        const s = data.subject as string | undefined;
        if (s) subjects.add(s.trim());
      }
    });
    return Array.from(subjects);
  } catch (error) {
    logger.error('Error fetching subject coverage:', error);
    return [];
  }
};