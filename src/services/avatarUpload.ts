// Avatar Upload Helper - Firebase Storage
// Place this in src/services/upload.ts or create a new avatarUpload.ts file

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload avatar to Firebase Storage
 * @param file - Image file to upload
 * @param userId - User ID for folder organization
 * @param onProgress - Optional progress callback (0-100)
 * @returns Download URL for the uploaded image
 */
export const uploadAvatar = async (
    file: File,
    userId: string,
    onProgress?: (percent: number) => void
): Promise<string> => {
    // Validate file
    if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file.');
    }
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('Avatar must be less than 2MB.');
    }

    // Create storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `avatars/${userId}/${timestamp}_${sanitizedFileName}`;

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Upload with progress tracking
    return new Promise<string>((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (onProgress) {
                    onProgress(percent);
                }
            },
            (error) => {
                console.error('Avatar upload error:', error);
                reject(new Error('Failed to upload avatar. Please try again.'));
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(new Error('Failed to get avatar URL. Please try again.'));
                }
            }
        );
    });
};
