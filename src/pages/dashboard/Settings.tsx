import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeta } from '../../context/MetaContext';
import {
    Pencil, User, Shield, AlertTriangle, Lock, Mail,
    CheckCircle, Star, Zap, Calendar, Camera, Trash2, LogOut
} from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';
import AvatarCropperModal from '../../components/AvatarCropperModal';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import CustomSelect from '../../components/CustomSelect';
import { buildSimpleOptions, collegeEmoji, semesterEmoji, courseEmoji } from '../../utils/dropdownOptions';
import { getCleanErrorMessage } from '../../utils/errorHandling';

// Helper to render cropped avatar using canvas
function getCroppedAvatarUrl(imageUrl: string, crop: { x: number; y: number; width: number; height: number; zoom: number } | undefined | null, callback: (url: string) => void) {
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
        ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
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

function formatMemberSince(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    try {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return 'Unknown';
    }
}

const SectionCard: React.FC<{
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    accentColor?: string;
}> = ({ icon, iconBg, title, subtitle, children, accentColor = 'bg-primary-50' }) => (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-72 h-72 ${accentColor} rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none`} />
        <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-7 pb-6 border-b border-slate-100">
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0 shadow-inner`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    </div>
);

const Settings = () => {
    const { userProfile, currentUser, updateUserProfile, deleteAccount, logout, resetPassword } = useAuth();
    const { colleges, semesters, courses, loading: metaLoading } = useMeta();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
    const [passwordResetSent, setPasswordResetSent] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [requiresReauth, setRequiresReauth] = useState(false);
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        college: string;
        semester: string;
        course: string;
        avatarOriginal: string;
        avatarCrop: { x: number; y: number; width: number; height: number; zoom: number } | undefined | null;
    }>({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        college: userProfile?.college || '',
        semester: userProfile?.semester || '',
        course: userProfile?.course || '',
        avatarOriginal: userProfile?.avatarOriginal || '',
        avatarCrop: userProfile?.avatarCrop ?? null,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
    const [editingExistingAvatar, setEditingExistingAvatar] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [rawAvatar, setRawAvatar] = useState<string | undefined>(undefined);

    // Check if user signed in with Google (password reset not applicable)
    const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === 'google.com') ?? false;

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
                avatarCrop: userProfile.avatarCrop ?? null,
            });
        }
    }, [userProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            if (!formData.name.trim()) throw new Error('Name is required.');
            if (!formData.email.trim()) throw new Error('Email is required.');
            if (!formData.college.trim()) throw new Error('College is required.');
            if (!formData.semester.trim()) throw new Error('Semester is required.');
            if (!formData.course.trim()) throw new Error('Course is required.');
            await updateUserProfile(formData);
            setMessage('Profile updated successfully!');
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            const errorMessage = getCleanErrorMessage(error, 'Failed to update profile. Please try again.');
            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!userProfile?.email) return;
        setIsPasswordResetLoading(true);
        try {
            await resetPassword(userProfile.email);
            setPasswordResetSent(true);
            toast.success('Password reset email sent!');
        } catch (error: any) {
            toast.error(getCleanErrorMessage(error, 'Failed to send reset email.'));
        } finally {
            setIsPasswordResetLoading(false);
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
            setRawAvatar(data.secure_url);
            setEditingExistingAvatar(false);
            setCropperOpen(true);
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload avatar.');
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEditExistingAvatar = () => {
        if (formData.avatarOriginal) {
            setRawAvatar(formData.avatarOriginal);
            setEditingExistingAvatar(true);
            setCropperOpen(true);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob, cropParams?: any) => {
        setCropperOpen(false);
        setAvatarUploading(true);
        try {
            const localUrl = URL.createObjectURL(croppedBlob);
            setAvatarPreview(localUrl);
            setFormData(prev => ({ ...prev, avatarCrop: cropParams }));
            toast.success('Avatar ready! Click Update Profile to save.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to prepare avatar.');
        } finally {
            setAvatarUploading(false);
            setRawAvatar(undefined);
            setEditingExistingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setFormData(prev => ({ ...prev, avatarOriginal: '', avatarCrop: null }));
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
            setShowDeleteModal(false);
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                setRequiresReauth(true);
            } else {
                toast.error(getCleanErrorMessage(error, 'Failed to delete account. Please try again.'));
            }
        } finally {
            setIsDeleteLoading(false);
        }
    };

    useEffect(() => {
        const original = formData.avatarOriginal || userProfile?.avatarOriginal;
        let crop = formData.avatarCrop !== undefined ? formData.avatarCrop : userProfile?.avatarCrop;
        if (crop === null) crop = undefined;
        if (original) {
            if (crop) {
                getCroppedAvatarUrl(original, crop, setAvatarPreview);
            } else {
                setAvatarPreview(original);
            }
        } else if (currentUser?.photoURL) {
            setAvatarPreview(currentUser.photoURL);
        } else {
            setAvatarPreview(undefined);
        }
    }, [formData.avatarOriginal, formData.avatarCrop, userProfile?.avatarOriginal, userProfile?.avatarCrop, currentUser?.photoURL]);

    // ─── Skeleton loading state ────────────────────────────────────────────────
    if (!userProfile) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton variant="circle" width={72} height={72} />
                        <div className="flex-1">
                            <Skeleton variant="text" width={180} height={22} className="mb-2" />
                            <Skeleton variant="text" width={220} height={15} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} variant="rect" width="100%" height={48} className={i === 4 ? 'md:col-span-2' : ''} />
                        ))}
                    </div>
                    <div className="flex justify-end mt-6">
                        <Skeleton variant="rect" width={160} height={44} />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Derived values ────────────────────────────────────────────────────────
    const initials = userProfile.name ? userProfile.name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const xp = userProfile.xp ?? 0;
    const streak = userProfile.streak ?? 0;
    const memberSince = formatMemberSince(userProfile.createdAt);

    return (
        <div className="max-w-3xl mx-auto space-y-6 lg:space-y-7 pb-12">

            {/* Page header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 font-medium mt-1">Manage your account settings and preferences</p>
            </div>

            {/* ── 1. Account Overview Card ───────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl shadow-primary-500/20">
                {/* decorative blobs */}
                <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-900/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                    <span className="text-3xl font-black text-white select-none">{initials}</span>
                                </div>
                            )}
                        </div>
                        {/* Quick upload overlay */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarUploading}
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                            title="Change photo"
                        >
                            <Camera className="w-4 h-4 text-primary-600" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-xl sm:text-2xl font-black text-white truncate">{userProfile.name}</h2>
                            {userProfile.role === 'admin' && (
                                <span className="px-2.5 py-0.5 bg-amber-400 text-amber-900 font-bold text-xs rounded-full uppercase tracking-wide shrink-0">Admin</span>
                            )}
                        </div>
                        <p className="text-sm text-white/70 font-medium truncate mb-4">{userProfile.email}</p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-sm font-bold text-white">{xp.toLocaleString()} XP</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                                <Star className="w-3.5 h-3.5 text-orange-300" />
                                <span className="text-sm font-bold text-white">{streak} day streak</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                                <span className="text-sm font-bold text-white">Since {memberSince}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. Profile Information ─────────────────────────────────────────── */}
            <SectionCard
                icon={<User className="w-6 h-6 text-primary-600" />}
                iconBg="bg-primary-50"
                title="Profile Information"
                subtitle="Update your personal information and profile picture"
                accentColor="bg-primary-50"
            >
                <form onSubmit={handleSubmit}>
                    {/* Avatar section */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Profile Picture</label>
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shadow-inner border border-slate-200">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-primary-500 to-cyan-500 flex items-center justify-center">
                                            <span className="text-4xl sm:text-5xl font-black text-white select-none">{initials}</span>
                                        </div>
                                    )}
                                </div>
                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={handleEditExistingAvatar}
                                        className="absolute -bottom-2 -right-2 bg-white rounded-xl p-2 shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
                                        disabled={avatarUploading}
                                        title="Edit Image"
                                    >
                                        <Pencil className="w-4 h-4 text-slate-600" />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2.5 bg-primary-50 text-primary-700 font-bold text-sm rounded-xl hover:bg-primary-100 transition-colors"
                                    disabled={avatarUploading}
                                >
                                    {avatarUploading ? 'Uploading...' : 'Change picture'}
                                </button>
                                {formData.avatarOriginal && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="px-4 py-2.5 bg-white border border-slate-200 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors"
                                        disabled={avatarUploading}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full bg-slate-50/50 border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-colors text-[15px] font-medium text-slate-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                                Email Address
                                <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Read-only</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="block w-full bg-slate-100/50 border border-slate-200 rounded-xl py-3 px-4 text-[15px] font-medium text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="college" className="block text-sm font-bold text-slate-700 mb-2">
                                College/University <span className="text-rose-500">*</span>
                            </label>
                            {metaLoading ? (
                                <Skeleton variant="rect" width="100%" height={48} className="rounded-xl" />
                            ) : (
                                <CustomSelect
                                    id="college"
                                    value={formData.college}
                                    onChange={handleSelectChange('college')}
                                    placeholder="Select College"
                                    options={buildSimpleOptions(colleges, collegeEmoji)}
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="semester" className="block text-sm font-bold text-slate-700 mb-2">
                                Current Semester <span className="text-rose-500">*</span>
                            </label>
                            {metaLoading ? (
                                <Skeleton variant="rect" width="100%" height={48} className="rounded-xl" />
                            ) : (
                                <CustomSelect
                                    id="semester"
                                    value={formData.semester}
                                    onChange={handleSelectChange('semester')}
                                    placeholder="Select Semester"
                                    options={buildSimpleOptions(semesters, semesterEmoji)}
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="course" className="block text-sm font-bold text-slate-700 mb-2">
                                Course/Program <span className="text-rose-500">*</span>
                            </label>
                            {metaLoading ? (
                                <Skeleton variant="rect" width="100%" height={48} className="rounded-xl" />
                            ) : (
                                <CustomSelect
                                    id="course"
                                    value={formData.course}
                                    onChange={handleSelectChange('course')}
                                    placeholder="Select Course"
                                    options={buildSimpleOptions(courses, courseEmoji)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Feedback message */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-xl border font-semibold text-sm flex items-center gap-2.5 ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {message.includes('success') ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                            {message}
                        </div>
                    )}

                    <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-primary-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center w-full sm:w-auto min-w-[160px]"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── 3. Password & Security ─────────────────────────────────────────── */}
            {!isGoogleUser && (
                <SectionCard
                    icon={<Lock className="w-6 h-6 text-sky-600" />}
                    iconBg="bg-sky-50"
                    title="Password & Security"
                    subtitle="Manage your password and account security"
                    accentColor="bg-sky-50"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                            <p className="text-sm font-medium text-slate-500 mt-1 max-w-md leading-relaxed">
                                We'll send a password reset link to <strong className="text-slate-700">{userProfile.email}</strong>. Check your inbox and follow the instructions.
                            </p>
                        </div>

                        {passwordResetSent ? (
                            <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm rounded-xl shrink-0">
                                <CheckCircle className="w-4 h-4" />
                                Email sent!
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                disabled={isPasswordResetLoading}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-sky-50 border border-sky-200 text-sky-700 font-bold text-sm rounded-xl hover:bg-sky-100 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-colors shrink-0 disabled:opacity-60 disabled:pointer-events-none w-full sm:w-auto"
                            >
                                <Mail className="w-4 h-4" />
                                {isPasswordResetLoading ? 'Sending...' : 'Send Reset Email'}
                            </button>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ── 4. Danger Zone ────────────────────────────────────────────────── */}
            <div className="bg-rose-50/60 rounded-3xl shadow-sm border border-rose-100 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-6 border-b border-rose-100">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-rose-100">
                            <Shield className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Danger Zone</h2>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">Irreversible account actions — proceed with care</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Delete Account</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1 max-w-lg leading-relaxed">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-rose-200 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-50 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-colors w-full sm:w-auto whitespace-nowrap"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Delete Account Modal ───────────────────────────────────────────── */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-[15px]">
                                {requiresReauth ? 'Security Check Required' : 'This action cannot be undone'}
                            </p>
                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                {requiresReauth ? 'Please re-authenticate to continue' : 'All your data will be permanently removed'}
                            </p>
                        </div>
                    </div>

                    {requiresReauth ? (
                        <div className="mb-6">
                            <p className="text-slate-700 text-sm font-medium mb-2">
                                For your security, you must have recently signed in to delete your account.
                            </p>
                            <p className="text-slate-700 text-sm font-semibold">
                                Please log out and log back in, then try again.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* What gets deleted */}
                            <p className="text-sm font-semibold text-slate-700 mb-3">Deleting your account will permanently remove:</p>
                            <ul className="space-y-2 mb-6">
                                {[
                                    'Your profile information',
                                    'Your uploaded papers',
                                    'Your liked papers',
                                    'All other account data',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                        <span className="w-5 h-5 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                                            <Trash2 className="w-3 h-3 text-rose-500" />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            {/* Email confirmation */}
                            <div className="mb-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Type your email to confirm: <span className="text-rose-600 font-semibold">{userProfile?.email}</span>
                                </label>
                                <input
                                    type="email"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 text-sm font-medium text-slate-900 bg-slate-50/50 transition-colors"
                                />
                            </div>
                        </>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setRequiresReauth(false);
                                setDeleteConfirmation('');
                            }}
                            className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            Cancel
                        </button>
                        {requiresReauth ? (
                            <button
                                type="button"
                                onClick={async () => { await logout(); navigate('/login'); }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out & Re-authenticate
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== userProfile?.email || isDeleteLoading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                            >
                                {isDeleteLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete My Account
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Avatar cropper */}
            {cropperOpen && rawAvatar && (
                <AvatarCropperModal
                    isOpen={cropperOpen}
                    imageUrl={rawAvatar}
                    onCropComplete={handleCropComplete}
                    onClose={() => {
                        setCropperOpen(false);
                        setRawAvatar(undefined);
                        setEditingExistingAvatar(false);
                    }}
                    initialCrop={editingExistingAvatar ? (formData.avatarCrop ?? undefined) : undefined}
                />
            )}
        </div>
    );
};

export default Settings;