import { collection, addDoc, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface PaperData {
  id?: string;
  title: string;
  subject: string;
  course: string;
  semester: string;
  college: string;
  examType: string;
  description?: string;
  uploaderId: string;
  uploaderName: string;
  status: 'pending' | 'approved' | 'rejected';
  likeCount: number;
  downloadCount: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: any; // Firestore Timestamp only
  updatedAt?: any; // Firestore Timestamp only
}

export const uploadPaper = async (
  file: File,
  paperData: Omit<PaperData, 'fileUrl' | 'fileName' | 'fileSize' | 'createdAt' | 'updatedAt' | 'likeCount' | 'downloadCount'>,
  onProgress?: (percent: number) => void
): Promise<string> => {
  try {
    // Validate file
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed. Please select a PDF file.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB. Please compress your PDF or choose a smaller file.');
    }

    // Validate required fields
    if (!paperData.title.trim()) {
      throw new Error('Paper title is required.');
    }
    if (!paperData.subject.trim()) {
      throw new Error('Subject is required.');
    }
    if (!paperData.course.trim()) {
      throw new Error('Course is required.');
    }
    if (!paperData.semester.trim()) {
      throw new Error('Semester is required.');
    }
    if (!paperData.college.trim()) {
      throw new Error('College is required.');
    }
    if (!paperData.examType.trim()) {
      throw new Error('Exam type is required.');
    }

    // Firebase Storage upload with real-time progress
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `papers/${paperData.uploaderId}/${timestamp}_${sanitizedFileName}`;

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
    });

    // Real-time upload progress tracking
    const fileUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress(percent);
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Firebase Storage upload error:', error);
          reject(new Error('File upload failed. Please check your internet connection and try again.'));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(new Error('Failed to get file URL. Please try again.'));
          }
        }
      );
    });

    // Save paper data to Firestore
    const paperDataToSave = {
      ...paperData,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      downloadCount: 0
    };
    const paperDoc = await addDoc(collection(db, 'papers'), paperDataToSave);

    // Optionally, trigger sitemap regeneration after upload
    // This could be implemented as a server function to keep the sitemap up-to-date
    try {
      // This is just a placeholder - implement based on your needs
      // await fetch('/api/regenerate-sitemap', { method: 'POST' });
    } catch (error) {
      console.error('Failed to trigger sitemap regeneration:', error);
      // Non-critical error, don't throw
    }

    return paperDoc.id;
  } catch (error: any) {
    console.error('Upload error:', error);
    // Provide more specific error messages
    if (error.message.includes('storage') || error.message.includes('upload')) {
      throw new Error('File upload failed. Please check your internet connection and try again.');
    } else if (error.message.includes('Firestore')) {
      throw new Error('Failed to save paper data. Please try again.');
    } else {
      throw error;
    }
  }
};

export const incrementDownloadCount = async (paperId: string): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      downloadCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing download count:', error);
  }
};

export const incrementLikeCount = async (paperId: string, shouldIncrement: boolean): Promise<void> => {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      likeCount: shouldIncrement ? increment(1) : increment(-1)
    });
  } catch (error) {
    console.error('Error updating like count:', error);
  }
};