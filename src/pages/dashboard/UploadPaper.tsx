import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadPaper } from '../../services/upload';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMeta } from '../../context/MetaContext';
import Select from 'react-select';

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
      const paperData = {
        ...formData,
        uploaderId: userProfile.uid,
        uploaderName: userProfile.name,
        status: 'pending' as const
      };

      await uploadPaper(selectedFile, paperData);
      
      // Show success toast and redirect
      toast.success('Paper uploaded successfully! Redirecting to My Uploads...');
      navigate('/dashboard/uploads');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Paper</h1>
        <p className="text-gray-600">Share your question papers with the community</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {errors.submit && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                isDragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer inline-flex items-center"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="mt-2 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Paper Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Paper Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter paper title"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Subject Dropdown (dynamic) */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <Select
                id="subject"
                name="subject"
                options={subjects.map(s => ({ value: typeof s === 'string' ? s : s.name, label: typeof s === 'string' ? s : s.name }))}
                value={formData.subject ? { value: formData.subject, label: formData.subject } : null}
                onChange={option => setFormData(prev => ({ ...prev, subject: option?.value || '' }))}
                isLoading={metaLoading}
                placeholder="Select Subject"
                classNamePrefix="react-select"
                className={errors.subject ? 'border-red-300' : ''}
              />
              {errors.subject && (
                <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Course Dropdown (dynamic) */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course *
              </label>
              <Select
                id="course"
                name="course"
                options={courses.map(c => ({ value: typeof c === 'string' ? c : c.name, label: typeof c === 'string' ? c : c.name }))}
                value={formData.course ? { value: formData.course, label: formData.course } : null}
                onChange={option => setFormData(prev => ({ ...prev, course: option?.value || '' }))}
                isLoading={metaLoading}
                placeholder="Select Course"
                classNamePrefix="react-select"
                className={errors.course ? 'border-red-300' : ''}
              />
              {errors.course && (
                <p className="mt-2 text-sm text-red-600">{errors.course}</p>
              )}
            </div>

            {/* Semester Dropdown (dynamic) */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Semester *
              </label>
              <Select
                id="semester"
                name="semester"
                options={semesters.map(s => ({ value: typeof s === 'string' ? s : s.name, label: typeof s === 'string' ? s : s.name }))}
                value={formData.semester ? { value: formData.semester, label: formData.semester } : null}
                onChange={option => setFormData(prev => ({ ...prev, semester: option?.value || '' }))}
                isLoading={metaLoading}
                placeholder="Select Semester"
                classNamePrefix="react-select"
                className={errors.semester ? 'border-red-300' : ''}
              />
              {errors.semester && (
                <p className="mt-2 text-sm text-red-600">{errors.semester}</p>
              )}
            </div>

            {/* College Dropdown (dynamic) */}
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                College *
              </label>
              <Select
                id="college"
                name="college"
                options={colleges.map(c => ({ value: typeof c === 'string' ? c : c.name, label: typeof c === 'string' ? c : c.name }))}
                value={formData.college ? { value: formData.college, label: formData.college } : null}
                onChange={option => setFormData(prev => ({ ...prev, college: option?.value || '' }))}
                isLoading={metaLoading}
                placeholder="Select College"
                classNamePrefix="react-select"
                className={errors.college ? 'border-red-300' : ''}
              />
              {errors.college && (
                <p className="mt-2 text-sm text-red-600">{errors.college}</p>
              )}
            </div>

            {/* Exam Type Dropdown (dynamic) */}
            <div>
              <label htmlFor="examType" className="block text-sm font-medium text-gray-700">
                Exam Type *
              </label>
              <Select
                id="examType"
                name="examType"
                options={examTypes.map(t => ({ value: typeof t === 'string' ? t : t.name, label: typeof t === 'string' ? t : t.name }))}
                value={formData.examType ? { value: formData.examType, label: formData.examType } : null}
                onChange={option => setFormData(prev => ({ ...prev, examType: option?.value || '' }))}
                isLoading={metaLoading}
                placeholder="Select Exam Type"
                classNamePrefix="react-select"
                className={errors.examType ? 'border-red-300' : ''}
              />
              {errors.examType && (
                <p className="mt-2 text-sm text-red-600">{errors.examType}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Add any additional details about the paper..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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