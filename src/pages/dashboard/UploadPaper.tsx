import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadPaper } from '../../services/upload';
import { getUserPapers } from '../../services/papers';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMeta } from '../../context/MetaContext';
import CustomSelect from '../../components/CustomSelect';
import { buildSimpleOptions, collegeEmoji, semesterEmoji, courseEmoji, subjectEmoji, examTypeEmoji } from '../../utils/dropdownOptions';
import confetti from 'canvas-confetti';

const UploadPaper = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course: '',
    semester: '',
    college: '',
    examType: '',
    description: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const { colleges, semesters, courses, subjects, examTypes, loading: metaLoading } = useMeta();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, file: 'Only PDF files are allowed' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  // Add drag-and-drop handlers
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
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, file: 'Only PDF files are allowed' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.course) {
      newErrors.course = 'Course is required';
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.college) {
      newErrors.college = 'College is required';
    }

    if (!formData.examType) {
      newErrors.examType = 'Exam type is required';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a PDF file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedFile || !userProfile) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if this is the user's first paper BEFORE uploading
      const existingPapers = await getUserPapers(userProfile.uid);
      const isFirstUpload = existingPapers.length === 0;

      const paperData = {
        ...formData,
        uploaderId: userProfile.uid,
        uploaderName: userProfile.name,
        uploaderXP: (userProfile as any).xp ?? 0,
        uploaderType: 'registered' as const,
        status: 'pending' as const
      };

      await uploadPaper(selectedFile, paperData);

      // 🎉 Confetti on first upload!
      if (isFirstUpload) {
        confetti({
          particleCount: 180,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        });
        setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.6 }, angle: 60 }), 300);
        setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.6 }, angle: 120 }), 300);
        toast.success('🎉 Amazing! You just submitted your first paper! Welcome to the community!', { duration: 6000 });
      } else {
        toast.success('Paper uploaded successfully! Redirecting to My Uploads...');
      }

      navigate('/dashboard/my-uploads');
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to upload paper. Please try again.'
      }));
      toast.error(error.message || 'Failed to upload paper. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Upload Paper</h1>
        <p className="text-slate-500 font-medium mt-1">Share your question papers with the community and earn XP!</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-6 sm:p-8 lg:p-10 relative">
        {/* Decorative background blob */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        </div>

        {errors.submit && (
          <div className="mb-6 bg-rose-50 border border-rose-100 rounded-xl p-4 relative z-10">
            <p className="text-sm font-semibold text-rose-600">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Upload PDF File <span className="text-rose-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 group cursor-pointer ${isDragOver
                ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/50 hover:border-primary-300 hover:bg-slate-50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <FileText className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="text-left min-w-0 max-w-xs sm:max-w-sm">
                      <p className="text-[15px] font-bold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-primary-500" />
                  </div>
                  <p className="text-[15px] font-bold text-slate-700 mb-1">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-sm font-medium text-slate-500 mb-6">
                    Max file size: 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <span className="bg-white border border-slate-200 shadow-sm hover:shadow-md text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all duration-200 pointer-events-none">
                    Browse Files
                  </span>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="mt-2.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.file}
              </p>
            )}
          </div>

          {/* Paper Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                Paper Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full bg-slate-50/50 border rounded-xl shadow-sm py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors text-[15px] font-medium text-slate-900 ${errors.title ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-primary-500'
                  }`}
                placeholder="e.g. Midterm Operating Systems 2023"
              />
              {errors.title && (
                <p className="mt-2 text-sm font-semibold text-rose-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.title}</p>
              )}
            </div>

            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-2">
                Subject <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                id="subject"
                value={formData.subject}
                onChange={handleSelectChange('subject')}
                placeholder={metaLoading ? 'Loading...' : 'Select Subject'}
                disabled={metaLoading}
                required
                error={!!errors.subject}
                options={buildSimpleOptions(subjects, subjectEmoji)}
              />
              {errors.subject && (
                <p className="mt-1.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.subject}</p>
              )}
            </div>

            {/* Course Dropdown */}
            <div>
              <label htmlFor="course" className="block text-sm font-bold text-slate-700 mb-2">
                Course <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                id="course"
                value={formData.course}
                onChange={handleSelectChange('course')}
                placeholder={metaLoading ? 'Loading...' : 'Select Course'}
                disabled={metaLoading}
                required
                error={!!errors.course}
                options={buildSimpleOptions(courses, courseEmoji)}
              />
              {errors.course && (
                <p className="mt-1.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.course}</p>
              )}
            </div>

            {/* Semester Dropdown */}
            <div>
              <label htmlFor="semester" className="block text-sm font-bold text-slate-700 mb-2">
                Semester <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                id="semester"
                value={formData.semester}
                onChange={handleSelectChange('semester')}
                placeholder={metaLoading ? 'Loading...' : 'Select Semester'}
                disabled={metaLoading}
                required
                error={!!errors.semester}
                options={buildSimpleOptions(semesters, semesterEmoji)}
              />
              {errors.semester && (
                <p className="mt-1.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.semester}</p>
              )}
            </div>

            {/* College Dropdown */}
            <div>
              <label htmlFor="college" className="block text-sm font-bold text-slate-700 mb-2">
                College <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                id="college"
                value={formData.college}
                onChange={handleSelectChange('college')}
                placeholder={metaLoading ? 'Loading...' : 'Select College'}
                disabled={metaLoading}
                required
                error={!!errors.college}
                options={buildSimpleOptions(colleges, collegeEmoji)}
              />
              {errors.college && (
                <p className="mt-1.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.college}</p>
              )}
            </div>

            {/* Exam Type Dropdown */}
            <div>
              <label htmlFor="examType" className="block text-sm font-bold text-slate-700 mb-2">
                Exam Type <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                id="examType"
                value={formData.examType}
                onChange={handleSelectChange('examType')}
                placeholder={metaLoading ? 'Loading...' : 'Select Exam Type'}
                disabled={metaLoading}
                required
                error={!!errors.examType}
                options={buildSimpleOptions(examTypes, examTypeEmoji)}
              />
              {errors.examType && (
                <p className="mt-1.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.examType}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
              Description <span className="text-slate-400 font-medium">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full bg-slate-50/50 border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 text-[15px] font-medium text-slate-900 transition-colors"
              placeholder="Add any additional context, year, professor name, or notes about the paper..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-primary-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center min-w-[160px]"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {isLoading ? 'Uploading...' : 'Upload Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPaper; 