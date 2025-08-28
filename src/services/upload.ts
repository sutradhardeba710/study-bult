import { collection, addDoc, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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

    // Cloudinary upload with progress
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!uploadPreset) {
      console.error('Cloudinary upload preset is not configured');
      throw new Error('File upload configuration is missing. Please contact the administrator.');
    }
    
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'papers');

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error('Cloudinary cloud name is not configured');
      throw new Error('File upload configuration is missing. Please contact the administrator.');
    }
    
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const xhr = new XMLHttpRequest();
    const promise = new Promise<{ secure_url: string; original_filename: string }>((resolve, reject) => {
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (!data.secure_url) {
            reject(new Error('File upload failed. Please try again.'));
          } else {
            resolve(data);
          }
        } else {
          reject(new Error('File upload failed. Please check your internet connection and try again.'));
        }
      };
      xhr.onerror = () => reject(new Error('File upload failed. Please check your internet connection and try again.'));
      xhr.send(formData);
    });

    const data = await promise;

    // Save paper data to Firestore (or your DB)
    const paperDataToSave = {
      ...paperData,
      fileUrl: data.secure_url,
      fileName: data.original_filename,
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
    if (error.message.includes('Cloudinary') || error.message.includes('upload')) {
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