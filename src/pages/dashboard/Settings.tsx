import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeta } from '../../context/MetaContext';
import { Pencil, User, Shield, AlertTriangle } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';
import AvatarCropperModal from '../../components/AvatarCropperModal';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';

// Helper to render cropped avatar using canvas
function getCroppedAvatarUrl(imageUrl: string, crop: { x: number; y: number; width: number; height: number; zoom: number } | undefined, callback: (url: string) => void) {
  if (!imageUrl || !crop) {
    callback(imageUrl);
    return;
  }
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return callback(imageUrl);
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        callback(url);
      } else {
        callback(imageUrl);
      }
    }, 'image/jpeg', 0.95);
  };
  img.onerror = () => callback(imageUrl);
  img.src = imageUrl;
}

const Settings = () => {
  const { userProfile, updateUserProfile, deleteAccount } = useAuth();
  const { colleges, semesters, courses, loading: metaLoading } = useMeta();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    college: string;
    semester: string;
    course: string;
    avatarOriginal: string;
    avatarCrop: { x: number; y: number; width: number; height: number; zoom: number } | undefined;
  }>(
    {
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    college: userProfile?.college || '',
    semester: userProfile?.semester || '',
      course: userProfile?.course || '',
      avatarOriginal: userProfile?.avatarOriginal || '',
      avatarCrop: userProfile?.avatarCrop ?? undefined,
    }
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawAvatar, setRawAvatar] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        college: userProfile.college || '',
        semester: userProfile.semester || '',
        course: userProfile.course || '',
        avatarOriginal: userProfile.avatarOriginal || '',
        avatarCrop: userProfile.avatarCrop ?? undefined,
      });
    }
  }, [userProfile]);
  
  // Log meta data for debugging
  useEffect(() => {
    console.log('Meta data loaded:', { colleges, semesters, courses });
    console.log('User profile:', userProfile);
    console.log('Form data:', formData);
  }, [colleges, semesters, courses, userProfile, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required.');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required.');
      }
      if (!formData.college.trim()) {
        throw new Error('College is required.');
      }
      if (!formData.semester.trim()) {
        throw new Error('Semester is required.');
      }
      if (!formData.course.trim()) {
        throw new Error('Course is required.');
      }

      // Only now update the profile globally
      await updateUserProfile(formData);
      setMessage('Profile updated successfully!');
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be less than 2MB.');
      return;
    }
    setAvatarUploading(true);
    try {
      // Upload original image to Cloudinary
      const formDataCloud = new FormData();
      formDataCloud.append('file', file);
      formDataCloud.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UNSIGNED_PRESET');
      formDataCloud.append('folder', 'avatars');
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const res = await fetch(url, { method: 'POST', body: formDataCloud });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Failed to upload avatar.');
      setFormData(prev => ({ ...prev, avatarOriginal: data.secure_url }));
      // Open cropper with the new image
      setRawAvatar(data.secure_url);
      setCropperOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob, cropParams?: any) => {
    setCropperOpen(false);
    setAvatarUploading(true);
    try {
      // Show local preview immediately
      const localUrl = URL.createObjectURL(croppedBlob);
      setAvatarPreview(localUrl);
      // Only update local form state, do NOT call updateUserProfile here
      setFormData(prev => ({ ...prev, avatarCrop: cropParams }));
      toast.success('Avatar ready! Click Update Profile to save.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to prepare avatar.');
    } finally {
      setAvatarUploading(false);
      setRawAvatar(undefined);
    }
  };

  const handleRemoveAvatar = async () => {
    setFormData(prev => ({ ...prev, avatarOriginal: '', avatarCrop: undefined }));
    await updateUserProfile({ avatarOriginal: '', avatarCrop: null });
    toast.success('Avatar removed.');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userProfile?.email) {
      toast.error('Email confirmation does not match');
      return;
    }

    setIsDeleteLoading(true);
    try {
      await deleteAccount();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    // Prefer local formData values for preview if present, else fall back to userProfile
    const original = formData.avatarOriginal || userProfile?.avatarOriginal;
    let crop = formData.avatarCrop !== undefined ? formData.avatarCrop : userProfile?.avatarCrop;
    if (crop === null) crop = undefined;
    if (original && crop) {
      getCroppedAvatarUrl(original, crop, setAvatarPreview);
    } else if (original) {
      setAvatarPreview(original);
    } else {
      setAvatarPreview(undefined);
    }
  }, [
    formData.avatarOriginal,
    userProfile?.avatarOriginal,
    JSON.stringify(formData.avatarCrop ?? userProfile?.avatarCrop ?? {})
  ]);

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <Skeleton variant="text" width={160} height={20} className="mb-2" />
              <Skeleton variant="text" width={200} height={14} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="rect" width="100%" height={40} />
            <Skeleton variant="rect" width="100%" height={40} />
            <Skeleton variant="rect" width="100%" height={40} />
            <Skeleton variant="rect" width="100%" height={40} />
            <Skeleton variant="rect" width="100%" height={40} className="md:col-span-2" />
          </div>
          <div className="flex justify-end mt-6">
            <Skeleton variant="rect" width={140} height={40} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
            ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
              </div>
              <button
                type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200"
                disabled={avatarUploading}
              >
                  <Pencil className="w-4 h-4 text-gray-600" />
              </button>
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  accept="image/*" 
                />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
              disabled={avatarUploading}
            >
                  {avatarUploading ? 'Uploading...' : 'Change picture'}
            </button>
                {formData.avatarOriginal && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-sm font-medium text-red-600 hover:text-red-700 ml-4"
              disabled={avatarUploading}
                  >
                    Remove
                  </button>
                )}
          </div>
        </div>
          </div>

          {/* Rest of the form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>
            {/* College dropdown */}
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                College/University
              </label>
              {metaLoading ? (
                <Skeleton variant="rect" width="100%" height={40} className="mb-2" />
              ) : (
                <select
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select College</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.name}>{college.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Semester dropdown */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Current Semester
              </label>
              {metaLoading ? (
                <Skeleton variant="rect" width="100%" height={40} className="mb-2" />
              ) : (
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Semester</option>
                  {semesters.map(semester => (
                    <option key={semester.id} value={semester.name}>{semester.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Course dropdown */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Course/Program
              </label>
              {metaLoading ? (
                <Skeleton variant="rect" width="100%" height={40} className="mb-2" />
              ) : (
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Danger Zone</h2>
            <p className="text-sm text-gray-500">Irreversible account actions</p>
          </div>
        </div>

        <div className="border border-red-200 rounded-md p-4 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-medium">This action cannot be undone</h3>
          </div>
          
          <p className="text-gray-700 mb-4">
            Deleting your account will permanently remove all your data, including:
          </p>
          
          <ul className="list-disc pl-5 mb-6 text-gray-700 space-y-1">
            <li>Your profile information</li>
            <li>Your uploaded papers</li>
            <li>Your liked papers</li>
            <li>All other account data</li>
          </ul>

          <p className="text-gray-700 mb-6">
            To confirm deletion, please type your email address: <strong>{userProfile?.email}</strong>
          </p>
          
          <input
            type="email"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
          />
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== userProfile?.email || isDeleteLoading}
              className={`px-4 py-2 bg-red-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors ${
                deleteConfirmation !== userProfile?.email
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-red-700'
              }`}
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>

      {cropperOpen && rawAvatar && (
      <AvatarCropperModal
          isOpen={cropperOpen}
          imageUrl={rawAvatar}
          onCropComplete={handleCropComplete}
          onClose={() => setCropperOpen(false)}
      />
      )}
    </div>
  );
};

export default Settings; 