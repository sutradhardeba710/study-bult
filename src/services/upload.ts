import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { storage } from './firebase';
import { db } from './firebaseDb';
import { trackModalConversion } from './modalAnalytics';

export interface PaperData {
  id?: string;
  title: string;
  college: string;
  semester: string;
  course: string;
  subject: string;
  examType: string;
  description?: string;
  uploaderType: 'guest' | 'registered';  // NEW: Track upload type
  uploaderId: string;
  uploaderName: string;
  uploaderEmail?: string;  // NEW: Required for guest uploads
  fileUrl: string;
  fileName: string;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: unknown;
  updatedAt?: unknown;
  likeCount: number;
  downloadCount: number;
  fileSize?: number;
  uploaderXP?: number;  // uploader's XP at time of upload — used for level badge display
}

/**
 * Upload a paper to Firebase Storage and save metadata to Firestore
 * @param file - The PDF file to upload
 * @param paperData - The paper metadata
 * @param onProgress - Optional callback to track upload progress
 * @returns Promise that resolves to the document ID
 */
export const uploadPaper = async (
  file: File,
  paperData: Omit<PaperData, 'id' | 'fileUrl' | 'fileName' | 'createdAt' | 'updatedAt' | 'likeCount' | 'downloadCount'>,
  onProgress?: (percent: number) => void
): Promise<string> => {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }



    // Note: Thumbnail generation is handled by Firebase Cloud Function
    // The Cloud Function will automatically generate a thumbnail when the PDF is uploaded


    // Generate organized storage path
    const now = new Date();
    const uploadDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const year = now.getFullYear();
    const month = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

    // Create slug from paper title (max 50 chars, URL-safe)
    const titleSlug = paperData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // Create slug from subject
    const subjectSlug = (paperData.subject || 'uncategorized')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    // Create slug from college
    const collegeSlug = (paperData.college || 'uncategorized')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    // New organized format: papers/YEAR/MONTH/COLLEGE/SUBJECT/title-slug-YYYY-MM-DD.pdf
    const storagePath = `papers/${year}/${month}/${collegeSlug}/${subjectSlug}/${titleSlug}-${uploadDate}.pdf`;
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking and caching headers
    const metadata = {
      cacheControl: 'public, max-age=31536000' // Cache for 1 year
    };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Wait for upload to complete
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress from 0% to 100%
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          reject(new Error('File upload failed. Please check your internet connection and try again.'));
        },
        () => {
          // Upload completed successfully
          resolve();
        }
      );
    });

    // Get download URL
    const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);

    // Save paper data to Firestore
    const paperDataToSave: Omit<PaperData, 'id'> & { storagePath: string } = {
      ...paperData,
      uploaderType: 'registered', // Mark as registered user upload
      fileUrl,
      fileName: file.name,
      storagePath, // Save the storage path for reliable lookup by Cloud Function
      uploaderXP: ('uploaderXP' in paperData ? Number((paperData as Record<string, unknown>).uploaderXP) : 0),
      // thumbnailUrl will be added by Cloud Function after upload
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      downloadCount: 0,
    };

    const paperDoc = await addDoc(collection(db, 'papers'), paperDataToSave);

    // Track modal conversion if user clicked upload from modal
    trackModalConversion(paperData.uploaderId, paperData.uploaderName);

    return paperDoc.id;
  } catch (error) {
    console.error('Error uploading paper:', error);
    const err = error as Error;
    if (err.message && (err.message.includes('storage') || err.message.includes('upload'))) {
      throw new Error('File upload failed. Please check your internet connection and try again.');
    } else if (err.message && err.message.includes('Firestore')) {
      throw new Error('Failed to save paper data. Please try again.');
    } else {
      throw error;
    }
  }
};

/**
 * Increment download count for a paper
 * @param paperId - The ID of the paper
 */
export const incrementDownloadCount = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      downloadCount: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing download count:', error);
  }
};

/**
 * Update like count for a paper
 * @param paperId - The ID of the paper
 * @param shouldIncrement - If true, increment; if false, decrement
 */
export const incrementLikeCount = async (paperId: string, shouldIncrement: boolean): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      likeCount: shouldIncrement ? increment(1) : increment(-1),
    });
  } catch (error) {
    console.error('Error updating like count:', error);
  }
};

/**
 * Upload a paper as a guest user (no authentication required)
 * @param file - The PDF file to upload
 * @param paperData - The paper metadata including guest info
 * @param guestInfo - Guest user information (name and email)
 * @param onProgress - Optional callback to track upload progress
 * @returns Promise that resolves to the document ID
 */
export const uploadPaperAsGuest = async (
  file: File,
  paperData: Omit<PaperData, 'id' | 'fileUrl' | 'fileName' | 'createdAt' | 'updatedAt' | 'likeCount' | 'downloadCount' | 'uploaderType' | 'uploaderId' | 'uploaderName' | 'uploaderEmail'>,
  guestInfo: { name: string; email: string },
  onProgress?: (percent: number) => void
): Promise<string> => {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    // Validate guest info
    if (!guestInfo.name || guestInfo.name.trim().length === 0) {
      throw new Error('Guest name is required');
    }

    if (!guestInfo.email || !guestInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Valid email address is required');
    }

    // Generate organized storage path
    const now = new Date();
    const uploadDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const year = now.getFullYear();
    const month = now.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

    // Create slug from paper title (max 50 chars, URL-safe)
    const titleSlug = paperData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // Create slug from subject
    const subjectSlug = (paperData.subject || 'uncategorized')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    // Create slug from college
    const collegeSlug = (paperData.college || 'uncategorized')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    // Storage path for guest uploads
    const storagePath = `papers/${year}/${month}/${collegeSlug}/${subjectSlug}/guest-${titleSlug}-${uploadDate}.pdf`;
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking and caching headers
    const metadata = {
      cacheControl: 'public, max-age=31536000' // Cache for 1 year
    };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Wait for upload to complete
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress from 0% to 100%
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          reject(new Error('File upload failed. Please check your internet connection and try again.'));
        },
        () => {
          // Upload completed successfully
          resolve();
        }
      );
    });

    // Get download URL
    const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);

    // Generate guest user ID
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Save paper data to Firestore with guest info
    const paperDataToSave: Omit<PaperData, 'id'> & { storagePath: string } = {
      ...paperData,
      uploaderType: 'guest',
      uploaderId: guestId,
      uploaderName: guestInfo.name.trim(),
      uploaderEmail: guestInfo.email.toLowerCase().trim(),
      fileUrl,
      fileName: file.name,
      storagePath,
      status: 'pending', // Always pending for guest uploads
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      downloadCount: 0,
    };

    const paperDoc = await addDoc(collection(db, 'papers'), paperDataToSave);

    return paperDoc.id;
  } catch (error) {
    console.error('Error uploading paper as guest:', error);
    const err = error as Error;
    if (err.message && (err.message.includes('storage') || err.message.includes('upload'))) {
      throw new Error('File upload failed. Please check your internet connection and try again.');
    } else if (err.message && err.message.includes('Firestore')) {
      throw new Error('Failed to save paper data. Please try again.');
    } else {
      throw error;
    }
  }
};

