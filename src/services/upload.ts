import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { storage, db } from './firebase';

export interface PaperData {
  id?: string;
  title: string;
  college: string;
  semester: string;
  course: string;
  subject: string;
  examType: string;
  description?: string;
  uploaderId: string;
  uploaderName: string;
  fileUrl: string;
  fileName: string;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  updatedAt?: any;
  likeCount: number;
  downloadCount: number;
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

    // Create a safe file name
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Note: Thumbnail generation is handled by Firebase Cloud Function
    // The Cloud Function will automatically generate a thumbnail when the PDF is uploaded


    const storagePath = `papers/${paperData.uploaderId}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

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
    const paperDataToSave: Omit<PaperData, 'id'> = {
      ...paperData,
      fileUrl,
      fileName: file.name,
      // thumbnailUrl will be added by Cloud Function after upload
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      downloadCount: 0,
    };

    const paperDoc = await addDoc(collection(db, 'papers'), paperDataToSave);

    return paperDoc.id;
  } catch (error: any) {
    console.error('Error uploading paper:', error);
    if (error.message.includes('storage') || error.message.includes('upload')) {
      throw new Error('File upload failed. Please check your internet connection and try again.');
    } else if (error.message.includes('Firestore')) {
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
