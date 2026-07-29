import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, X, UploadCloud, AlertCircle, Star, Trophy, Zap, Users, CheckCircle } from 'lucide-react';
import { useMeta } from '../context/MetaContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { uploadPaper, uploadPaperAsGuest } from '../services/upload';
import AddOptionModal from '../components/AddOptionModal';
import GuestUploadModal from '../components/GuestUploadModal';
import { type MetaType } from '../services/meta';
import CustomSelect from '../components/CustomSelect';
import { buildCollegeOptions, buildSemesterOptions, buildCourseOptions, buildSubjectOptions, buildExamTypeOptions } from '../utils/dropdownOptions';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../services/firebaseDb';


import { loadGoogleMaps } from '../services/google';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Upload motivational tips shown in sequence
const UPLOAD_MESSAGES = [
  'Uploading your contribution… 📤',
  'Processing your paper… 🔍',
  'Almost there — future students will thank you! 🎓',
  'Finalizing… you\'re making a difference! ✨',
];

const Upload = () => {
  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes('your-')) {
      loadGoogleMaps(GOOGLE_MAPS_API_KEY).catch(console.warn);
    }
  }, []);

  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    college: '',
    semester: '',
    course: '',
    subject: '',
    examType: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessageIdx, setUploadMessageIdx] = useState(0);

  // Live activity counter — starts from real Firestore approved paper count
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [badgeFlash, setBadgeFlash] = useState(false);

  useEffect(() => {
    // Fetch real count of approved papers (lightweight aggregation)
    const fetchRealCount = async () => {
      try {
        const q = query(collection(db, 'papers'), where('status', '==', 'approved'));
        const snapshot = await getCountFromServer(q);
        setLiveCount(snapshot.data().count);
      } catch {
        // Fallback to a safe realistic range if fetch fails
        setLiveCount(Math.floor(Math.random() * 20) + 30);
      }
    };
    fetchRealCount();
  }, []);

  const isLiveCountNull = liveCount === null;

  useEffect(() => {
    if (!isLiveCountNull) return; // wait until real count is loaded
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = Math.floor(Math.random() * 8000) + 4000; // 4–12 seconds
      timeout = setTimeout(() => {
        setLiveCount(prev => (prev ?? 0) + Math.floor(Math.random() * 3) + 1);
        setBadgeFlash(true);
        setTimeout(() => setBadgeFlash(false), 600);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [isLiveCountNull]); // only start scheduling after first real count loads

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MetaType>('subjects');
  const [modalTitle, setModalTitle] = useState('');

  // Guest upload state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestInfo, setGuestInfo] = useState<{ name: string; email: string } | null>(null);

  const { colleges, semesters, courses, subjects, examTypes, loading: metaLoading, refreshMeta } = useMeta();

  // Show guest modal if not logged in
  useEffect(() => {
    if (!authLoading && !userProfile && !guestInfo) {
      setShowGuestModal(true);
    }
  }, [authLoading, userProfile, guestInfo]);

  // Cycle upload messages during upload
  useEffect(() => {
    if (!isUploading) return;
    const interval = setInterval(() => {
      setUploadMessageIdx(prev => (prev + 1) % UPLOAD_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isUploading]);

  // Global drag-and-drop
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragleave', handleDragLeave);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragleave', handleDragLeave);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleGuestContinue = (info: { name: string; email: string }) => {
    setGuestInfo(info);
    setShowGuestModal(false);
    toast.success(`Welcome, ${info.name}! You can now upload your paper.`);
  };

  const handleCreateAccount = () => {
    navigate('/register?redirect=/upload');
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const openAddModal = (type: MetaType, title: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleModalSuccess = async (newItemName: string) => {
    await refreshMeta();
    let fieldName = '';
    switch (modalType) {
      case 'colleges': fieldName = 'college'; break;
      case 'courses': fieldName = 'course'; break;
      case 'subjects': fieldName = 'subject'; break;
      case 'semesters': fieldName = 'semester'; break;
      case 'examTypes': fieldName = 'examType'; break;
    }
    if (fieldName) {
      setFormData(prev => ({ ...prev, [fieldName]: newItemName }));
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, file: 'Please select a PDF file' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
      return;
    }
    setSelectedFile(file);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.college) newErrors.college = 'Please select your college';
    if (!formData.semester) newErrors.semester = 'Please select your semester';
    if (!formData.course) newErrors.course = 'Please select your course';
    if (!formData.subject) newErrors.subject = 'Please select the subject';
    if (!formData.examType) newErrors.examType = 'Please select the exam type';
    if (!selectedFile) newErrors.file = 'Please select a PDF file to upload';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const RATE_LIMIT_SECONDS = 10;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lastUpload = localStorage.getItem('lastUploadTime');
    if (lastUpload && Date.now() - parseInt(lastUpload, 10) < RATE_LIMIT_SECONDS * 1000) {
      toast.error(`Please wait ${Math.ceil((RATE_LIMIT_SECONDS * 1000 - (Date.now() - parseInt(lastUpload, 10))) / 1000)} seconds before uploading again.`);
      return;
    }
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessageIdx(0);
    setUploadDone(false);
    const toastId = toast.loading('Uploading paper...');

    try {
      if (userProfile) {
        await uploadPaper(
          selectedFile!,
          { ...formData, uploaderType: 'registered', uploaderId: userProfile.uid, uploaderName: userProfile.name, status: 'pending' },
          (percent) => setUploadProgress(percent)
        );
      } else if (guestInfo) {
        await uploadPaperAsGuest(
          selectedFile!,
          { ...formData, status: 'pending' },
          guestInfo,
          (percent) => setUploadProgress(percent)
        );
      } else {
        throw new Error('Please provide your information to upload');
      }

      setUploadProgress(100);
      setUploadDone(true);
      toast.success('Paper uploaded! 🎉 It will be reviewed by our team.', { id: toastId });
      localStorage.setItem('lastUploadTime', Date.now().toString());
      localStorage.setItem('em_hasEverUploaded', 'true'); // suppress upload modal permanently
      sessionStorage.removeItem('uploadModal_sessionDismiss');

      setTimeout(() => {
        setFormData({ title: '', college: '', semester: '', course: '', subject: '', examType: '', description: '' });
        setSelectedFile(null);
        setGuestInfo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploading(false);
        setUploadDone(false);
        setUploadProgress(0);
      }, 2200);

    } catch (error: any) {
      toast.error(error.message || 'Failed to upload paper. Please try again.', { id: toastId });
      setIsUploading(false);
    }
  };

  const step1Done = !!selectedFile;
  const step2Done = !!(formData.title && formData.college && formData.semester && formData.course && formData.subject && formData.examType);
  const steps = [
    { label: 'Upload File', done: step1Done },
    { label: 'Details', done: step2Done },
    { label: 'Submit', done: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="upload-pattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#upload-pattern)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border border-white/20 transition-all duration-300 ${badgeFlash ? 'scale-110 bg-white/25' : 'scale-100'}`}>
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce-dot"></span>
                🔥{' '}
                {liveCount === null ? (
                  <span className="inline-block w-6 h-3 bg-white/30 rounded animate-pulse" />
                ) : (
                  <span className={`transition-all duration-300 ${badgeFlash ? 'text-yellow-300' : 'text-white'}`}>{liveCount}</span>
                )}{' '}
                papers uploaded — be next!
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Share a Paper,<br className="hidden sm:block" /> Help Hundreds
              </h1>
              <p className="mt-3 text-base sm:text-lg text-indigo-100 max-w-xl">
                Every paper you upload helps a student prepare better. Join 2,400+ contributors today.
              </p>
            </div>

            {/* XP & Rewards Card */}
            <div className="sm:w-60 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mt-2 sm:mt-0 flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-3">You'll earn</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                    <Zap size={16} className="text-yellow-300" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">+8 XP</p>
                    <p className="text-indigo-200 text-xs">Per paper uploaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center">
                    <Trophy size={16} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Contributor Badge</p>
                    <p className="text-indigo-200 text-xs">Shown on your profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                    <Star size={16} className="text-green-300" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Premium Access</p>
                    <p className="text-indigo-200 text-xs">Unlock all papers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof strip */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2">
              {['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-indigo-600 flex items-center justify-center text-white text-xs font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-indigo-100">
              <span className="font-semibold text-white">2,400+ students</span> already contributing
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Step Progress Bar */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl border border-gray-200 shadow-sm px-4 sm:px-6 py-4">
          <div className="flex items-center">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step.done
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                    : i === 0 && !step1Done
                      ? 'bg-white border-indigo-300 text-indigo-400 animate-pulse'
                      : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                    {step.done ? <CheckCircle size={18} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 font-semibold whitespace-nowrap ${step.done ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mb-5 rounded-full transition-all duration-500 ${step.done ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guest banner */}
        {guestInfo && (
          <div className="mb-5 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users size={16} className="text-indigo-600" />
            </div>
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">Uploading as guest:</span> {guestInfo.name} ({guestInfo.email})
            </p>
          </div>
        )}

        {/* File selected — commitment device */}
        {selectedFile && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-800">
              <span className="font-semibold">Great choice!</span> One paper = one student better prepared for exams 🎉
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-100">

            {/* ── Section 1: File Upload ── */}
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <UploadCloud size={18} className="text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Upload PDF File</h2>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Step 1</span>
              </div>

              {/* Drag zone — hidden on mobile, shown on md+ */}
              <div
                className={`hidden md:flex border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 flex-col items-center justify-center ${isDragOver
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-[1.01]'
                  : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <X size={14} /> Remove File
                    </button>
                  </div>
                ) : (
                  <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-14 h-14 mx-auto rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                      <UploadIcon className="w-7 h-7 text-indigo-500" />
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      {isDragOver ? '📂 Drop it here!' : 'Drag & drop your PDF here'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">PDF only · Max 10 MB</p>
                    <span className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm">
                      <UploadIcon className="w-4 h-4" /> Browse File
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile tap-to-upload button */}
              <div className="md:hidden">
                {selectedFile ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-4 rounded-xl text-base font-semibold transition-colors shadow-sm"
                  >
                    <UploadIcon className="w-5 h-5" />
                    Tap to Upload PDF
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {errors.file && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.file}
                </p>
              )}
            </div>

            {/* ── Section 2: Paper Details ── */}
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText size={18} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Paper Details</h2>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Step 2</span>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Paper Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Data Structures — Mid Term 2024"
                />
                <p className="mt-1.5 text-xs text-gray-400">A clear title helps students find this paper faster</p>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.title}
                  </p>
                )}
              </div>

              {/* 2-col grid on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* College */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College <span className="text-red-500">*</span>
                  </label>
                  {metaLoading ? (
                    <Skeleton variant="rect" width="100%" height={46} />
                  ) : (
                    <CustomSelect
                      value={formData.college}
                      onChange={handleSelectChange('college')}
                      placeholder="Select college"
                      error={!!errors.college}
                      options={buildCollegeOptions(colleges)}
                      onAddNew={() => openAddModal('colleges', 'College')}
                      addNewLabel="+ Add New College"
                    />
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">Helps students at your college find this</p>
                  {errors.college && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.college}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {metaLoading ? (
                    <Skeleton variant="rect" width="100%" height={46} />
                  ) : (
                    <CustomSelect
                      value={formData.semester}
                      onChange={handleSelectChange('semester')}
                      placeholder="Select semester"
                      error={!!errors.semester}
                      options={buildSemesterOptions(semesters)}
                      onAddNew={() => openAddModal('semesters', 'Semester')}
                      addNewLabel="+ Add New Semester"
                    />
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">So students in the right semester see it</p>
                  {errors.semester && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.semester}
                    </p>
                  )}
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  {metaLoading ? (
                    <Skeleton variant="rect" width="100%" height={46} />
                  ) : (
                    <CustomSelect
                      value={formData.course}
                      onChange={handleSelectChange('course')}
                      placeholder="Select course"
                      error={!!errors.course}
                      options={buildCourseOptions(courses)}
                      onAddNew={() => openAddModal('courses', 'Course')}
                      addNewLabel="+ Add New Course"
                    />
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">Filters papers by your degree program</p>
                  {errors.course && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.course}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {metaLoading ? (
                    <Skeleton variant="rect" width="100%" height={46} />
                  ) : (
                    <CustomSelect
                      value={formData.subject}
                      onChange={handleSelectChange('subject')}
                      placeholder="Select subject"
                      error={!!errors.subject}
                      options={buildSubjectOptions(subjects)}
                      onAddNew={() => openAddModal('subjects', 'Subject')}
                      addNewLabel="+ Add New Subject"
                    />
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">Tag the exact subject for fast discovery</p>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.subject}
                    </p>
                  )}
                </div>

                {/* Exam Type */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  {metaLoading ? (
                    <Skeleton variant="rect" width="100%" height={46} />
                  ) : (
                    <CustomSelect
                      value={formData.examType}
                      onChange={handleSelectChange('examType')}
                      placeholder="e.g., Mid Term, End Term, Internal…"
                      error={!!errors.examType}
                      options={buildExamTypeOptions(examTypes)}
                      onAddNew={() => openAddModal('examTypes', 'Exam Type')}
                      addNewLabel="+ Add New Exam Type"
                    />
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">Helps students target the exact exam they're preparing for</p>
                  {errors.examType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.examType}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Any extra details — year, topics covered, tips for the exam..."
                />
              </div>
            </div>

            {/* ── Submit Section ── */}
            <div className="p-5 sm:p-7 bg-gray-50/70 rounded-b-2xl">
              {/* Loss aversion nudge */}
              <div className="mb-4 flex items-start gap-2.5 text-sm text-gray-600">
                <Users size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <p>
                  Students at your college are searching for papers right now. <span className="font-medium text-indigo-600">Be the one who helps.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-400 order-2 sm:order-1">
                  ✅ Free to upload · Reviewed in 24–48 hrs · 100% anonymous option
                </p>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 disabled:cursor-not-allowed upload-cta-btn shadow-lg shadow-indigo-200"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Zap size={18} className="text-yellow-300" />
                      Share & Earn 8 XP
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-center sm:text-right text-xs text-gray-400">
                Takes ~30 seconds · Helps hundreds of students
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ── Upload Progress Overlay ── */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm text-center">
            {uploadDone ? (
              <div className="animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Paper Uploaded! 🎉</h3>
                <p className="text-sm text-gray-500">You just helped someone ace their exam.</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                  <Zap size={16} className="text-yellow-500" /> +8 XP earned!
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={26} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {UPLOAD_MESSAGES[uploadMessageIdx]}
                </h3>
                <p className="text-xs text-gray-400 mb-5">Please keep this tab open</p>
                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  />
                </div>
                <p className="text-sm font-semibold text-indigo-600">{uploadProgress}%</p>
              </>
            )}
          </div>
        </div>
      )}

      <AddOptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
        onSuccess={handleModalSuccess}
      />

      <GuestUploadModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onContinueAsGuest={handleGuestContinue}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default Upload;