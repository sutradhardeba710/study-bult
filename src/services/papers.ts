import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { PaperData } from './upload';

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
    let q = collection(db, 'papers');
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
    console.error('Error fetching papers:', error);
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
    console.error('Error fetching paper:', error);
    throw error;
  }
};

export const getUserPapers = async (userId: string): Promise<PaperData[]> => {
  try {
    console.log('Fetching papers for user:', userId);
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
    
    // Sort in memory instead of in query
    papers.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('Found papers:', papers.length, papers);
    return papers;
  } catch (error) {
    console.error('Error in getUserPapers:', error);
    throw error;
  }
};

export const getLikedPapers = async (userId: string): Promise<PaperData[]> => {
  try {
    // First get user's liked papers
    const likesQuery = query(
      collection(db, 'likes'),
      where('userId', '==', userId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    
    const paperIds = likesSnapshot.docs.map(doc => doc.data().paperId);
    
    if (paperIds.length === 0) {
      return [];
    }

    // Then fetch the actual papers
    const papers: PaperData[] = [];
    for (const paperId of paperIds) {
      const paper = await getPaperById(paperId);
      if (paper) {
        papers.push(paper);
      }
    }

    return papers;
  } catch (error) {
    console.error('Error fetching liked papers:', error);
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
  } catch (error) {
    console.error('Error liking paper:', error);
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
    console.error('Error unliking paper:', error);
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
    console.error('Error checking if paper is liked:', error);
    return false;
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
  } catch (error) {
    console.error('Error adding download:', error);
    throw error;
  }
};

export const getUserDownloads = async (userId: string): Promise<PaperData[]> => {
  try {
    // First get user's downloads
    // Temporarily removed orderBy to fix BloomFilter error
    // Add back once index is created: orderBy('createdAt', 'desc')
    const downloadsQuery = query(
      collection(db, 'downloads'),
      where('userId', '==', userId)
    );
    const downloadsSnapshot = await getDocs(downloadsQuery);
    
    const paperIds = downloadsSnapshot.docs.map(doc => doc.data().paperId);
    
    if (paperIds.length === 0) {
      return [];
    }

    // Then fetch the actual papers
    const papers: PaperData[] = [];
    for (const paperId of paperIds) {
      const paper = await getPaperById(paperId);
      if (paper) {
        papers.push(paper);
      }
    }

    // Sort by download date in memory
    const papersWithDownloadDates = await Promise.all(
      papers.map(async (paper) => {
        const downloadDate = await getDownloadDate(paper.id!, userId);
        return { ...paper, downloadDate };
      })
    );

    papersWithDownloadDates.sort((a, b) => {
      const dateA = a.downloadDate || a.updatedAt?.toDate?.() || a.createdAt?.toDate?.();
      const dateB = b.downloadDate || b.updatedAt?.toDate?.() || b.createdAt?.toDate?.();
      return dateB.getTime() - dateA.getTime();
    });

    return papersWithDownloadDates.map(({ downloadDate, ...paper }) => paper);
  } catch (error) {
    console.error('Error fetching user downloads:', error);
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
    console.error('Error getting download date:', error);
    return null;
  }
};

export const deletePaper = async (paperId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'papers', paperId));
  } catch (error) {
    console.error('Error deleting paper:', error);
    throw error;
  }
};

export const approvePaper = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, { status: 'approved' });
  } catch (error) {
    console.error('Error approving paper:', error);
    throw error;
  }
};

export const rejectPaper = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, { status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting paper:', error);
    throw error;
  }
};

export const deletePaperById = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await deleteDoc(paperRef);
  } catch (error) {
    console.error('Error deleting paper:', error);
    throw error;
  }
};

export const getPapersCount = async (): Promise<number> => {
  const snapshot = await getDocs(collection(db, 'papers'));
  return snapshot.size;
};

export const getPendingPapersCount = async (): Promise<number> => {
  const q = query(collection(db, 'papers'), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.size;
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
    console.error('Error fetching like events:', error);
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
    console.error('Error updating paper:', error);
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