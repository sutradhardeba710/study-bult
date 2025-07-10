import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pencil, User, Shield, Trash2 } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';
import AvatarCropperModal from '../../components/AvatarCropperModal';
import Select from 'react-select';

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
  const { userProfile, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
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
  let avatarPreviewUrl: string | undefined = undefined;

  const colleges = [
    'Delhi University',
    'Mumbai University',
    'Calcutta University',
    'Madras University',
    'Pune University',
    'Other'
  ];

  const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

  const courses = [
    'Computer Science Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Other'
  ];

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative w-16 h-16">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover object-center border-2 border-primary-400" />
            ) : (
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                {userProfile?.name?.[0] || <User className="w-8 h-8" />}
              </div>
            )}
            {/* Remove avatar button */}
            {formData.avatarOriginal && (
              <button type="button" onClick={handleRemoveAvatar} className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-gray-500 hover:text-red-600 shadow">
                &times;
              </button>
            )}
            {/* Edit (crop) avatar button */}
            {formData.avatarOriginal && (
              <button
                type="button"
                onClick={() => {
                  setRawAvatar(formData.avatarOriginal);
                  setCropperOpen(true);
                }}
                className="absolute bottom-0 left-0 bg-primary-600 text-white rounded-full p-1 border-2 border-white shadow hover:bg-primary-700 transition"
                title="Edit avatar"
                disabled={avatarUploading}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {/* Upload new avatar button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1 border-2 border-white shadow hover:bg-primary-700 transition"
              title="Change avatar"
              disabled={avatarUploading}
            >
              <User className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-600">Update your personal information</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                College
              </label>
              <Select
                id="college"
                name="college"
                options={colleges.map(c => ({ value: c, label: c }))}
                value={formData.college ? { value: formData.college, label: formData.college } : null}
                onChange={option => setFormData(prev => ({ ...prev, college: option?.value || '' }))}
                placeholder="Select College"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Semester
              </label>
              <Select
                id="semester"
                name="semester"
                options={semesters.map(s => ({ value: s, label: s }))}
                value={formData.semester ? { value: formData.semester, label: formData.semester } : null}
                onChange={option => setFormData(prev => ({ ...prev, semester: option?.value || '' }))}
                placeholder="Select Semester"
                classNamePrefix="react-select"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <Select
                id="course"
                name="course"
                options={courses.map(c => ({ value: c, label: c }))}
                value={formData.course ? { value: formData.course, label: formData.course } : null}
                onChange={option => setFormData(prev => ({ ...prev, course: option?.value || '' }))}
                placeholder="Select Course"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-600">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
            </div>
            <button className="btn-secondary text-sm">
              Change Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="btn-secondary text-sm">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
            <p className="text-sm text-gray-600">Irreversible and destructive actions</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
            <p className="text-sm text-gray-600">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>
      <AvatarCropperModal
        open={cropperOpen}
        image={rawAvatar}
        onClose={() => { setCropperOpen(false); setRawAvatar(undefined); }}
        onCropComplete={(blob, cropParams) => handleCropComplete(blob, cropParams)}
        loading={avatarUploading}
        initialCrop={formData.avatarCrop}
      />
    </div>
  );
};

export default Settings; 