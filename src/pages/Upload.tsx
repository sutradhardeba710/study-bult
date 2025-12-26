import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, X, Plus } from 'lucide-react';
import { useMeta } from '../context/MetaContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { uploadPaper } from '../services/upload';
import AddOptionModal from '../components/AddOptionModal';
import { type MetaType, type MetaItem } from '../services/meta';
import Select, { type SingleValue, type StylesConfig, components, type MenuListProps } from 'react-select';

// Custom styles for react-select to match Tailwind theme
const selectStyles: StylesConfig<any, false> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#2563eb' : '#d1d5db', // primary-600 or gray-300
    boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#2563eb' : '#9ca3af', // gray-400
    },
    paddingTop: '2px',
    paddingBottom: '2px',
    borderRadius: '0.375rem', // rounded-md
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white', // primary-600 or primary-50
    color: state.isSelected ? 'white' : '#1f2937', // gray-900
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#2563eb',
      color: 'white',
    },
  }),
  input: (base) => ({
    ...base,
    'input:focus': {
      boxShadow: 'none',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50, // Ensure it sits above other elements
  }),
};

// Custom MenuList component to add "Add New" button at the bottom
const CustomMenuList = (props: MenuListProps<any, false>) => {
  const { onAddNew, addNewLabel } = props.selectProps as any;

  return (
    <components.MenuList {...props}>
      {props.children}
      <div
        className="border-t border-gray-200 p-2 cursor-pointer hover:bg-gray-50 text-primary-600 font-medium text-sm flex items-center justify-center transition-colors"
        onClick={(_e) => {
          // Prevent the dropdown from closing immediately if needed, or let it close
          // e.stopPropagation(); 
          if (onAddNew) onAddNew();
        }}
        onMouseDown={(e) => {
          // Prevent input blur which closes the menu
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Plus size={16} className="mr-1" />
        {addNewLabel || 'Add New'}
      </div>
    </components.MenuList>
  );
};

const Upload = () => {
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MetaType>('subjects');
  const [modalTitle, setModalTitle] = useState('');

  const { colleges, semesters, courses, subjects, examTypes, loading: metaLoading, refreshMeta } = useMeta();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !userProfile) {
      const timeout = setTimeout(() => {
        navigate('/login?redirect=/upload');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [authLoading, userProfile, navigate]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Login Required</h2>
          <p className="text-gray-700 mb-4">You must be logged in to upload papers.<br />Redirecting to login...</p>
          <button
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => navigate('/login?redirect=/upload')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSelectChange = (newValue: SingleValue<{ value: string; label: string }>, actionMeta: { name?: string }) => {
    const name = actionMeta.name;
    const value = newValue?.value || '';

    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when user selects
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const openAddModal = (type: MetaType, title: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleModalSuccess = async (newItemName: string) => {
    await refreshMeta();

    // Map modal type back to form field name
    let fieldName = '';
    switch (modalType) {
      case 'colleges': fieldName = 'college'; break;
      case 'courses': fieldName = 'course'; break;
      case 'subjects': fieldName = 'subject'; break;
      case 'semesters': fieldName = 'semester'; break;
      case 'examTypes': fieldName = 'examType'; break;
    }

    if (fieldName) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: newItemName
      }));
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({
        ...prev,
        file: 'Please select a PDF file'
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({
        ...prev,
        file: 'File size must be less than 10MB'
      }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({
      ...prev,
      file: ''
    }));
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
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.college) {
      newErrors.college = 'Please select your college';
    }

    if (!formData.semester) {
      newErrors.semester = 'Please select your semester';
    }

    if (!formData.course) {
      newErrors.course = 'Please select your course';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select the subject';
    }

    if (!formData.examType) {
      newErrors.examType = 'Please select the exam type';
    }

    if (!selectedFile) {
      newErrors.file = 'Please select a PDF file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const RATE_LIMIT_SECONDS = 10; // Client-side rate limiting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side rate limit
    const lastUpload = localStorage.getItem('lastUploadTime');
    if (lastUpload && Date.now() - parseInt(lastUpload, 10) < RATE_LIMIT_SECONDS * 1000) {
      toast.error(`Please wait ${Math.ceil((RATE_LIMIT_SECONDS * 1000 - (Date.now() - parseInt(lastUpload, 10))) / 1000)} seconds before uploading again.`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading('Uploading paper...');
    try {
      await uploadPaper(
        selectedFile!,
        {
          ...formData,
          uploaderId: userProfile.uid,
          uploaderName: userProfile.name,
          status: 'pending',
        },
        (percent) => setUploadProgress(percent)
      );
      toast.success('Paper uploaded successfully!', { id: toastId });
      localStorage.setItem('lastUploadTime', Date.now().toString());
      // Reset form after successful upload
      setFormData({
        title: '',
        college: '',
        semester: '',
        course: '',
        subject: '',
        examType: '',
        description: '',
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload paper. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to create options
  const createOptions = (items: MetaItem[]) => {
    return items.map(item => ({
      value: item.name,
      label: item.status === 'pending' ? `${item.name} (Pending Approval)` : item.name
    }));
  };

  // Helper for grouped subjects
  const createSubjectOptions = () => {
    const grouped = subjects.reduce((acc, subject) => {
      const category = subject.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        value: subject.name,
        label: subject.status === 'pending' ? `${subject.name} (Pending Approval)` : subject.name
      });
      return acc;
    }, {} as Record<string, { value: string; label: string }[]>);

    return Object.entries(grouped).map(([category, items]) => ({
      label: category,
      options: items
    }));
  };

  return (
    <div
      className={`min-h-screen bg-gray-50${isDragOver ? ' ring-4 ring-primary-300' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Question Paper</h1>
          <p className="mt-2 text-gray-600">
            Share your question papers with the student community
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Upload PDF File
              </label>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragOver
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={removeFile}
                      variant="outline"
                      className="text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Drag and drop your PDF file here, or{' '}
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="text-primary-600 hover:text-primary-500 font-medium p-0 h-auto min-w-0"
                        >
                          browse
                        </Button>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum file size: 10MB. Only PDF files are accepted.
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {errors.file && (
                <p className="mt-2 text-sm text-red-600">{errors.file}</p>
              )}
            </div>

            {/* Paper Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Paper Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Data Structures and Algorithms - Mid Term"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* College */}
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                  College *
                </label>
                {metaLoading ? (
                  <Skeleton variant="rect" width="100%" height={38} className="mb-2" />
                ) : (
                  <Select
                    name="college"
                    options={createOptions(colleges)}
                    value={formData.college ? { value: formData.college, label: formData.college } : null}
                    onChange={handleSelectChange}
                    styles={selectStyles}
                    placeholder="Select college"
                    isClearable
                    className={errors.college ? 'border-red-300 rounded-md' : ''}
                    components={{ MenuList: CustomMenuList }}
                    // @ts-ignore - Custom props
                    onAddNew={() => openAddModal('colleges', 'College')}
                    addNewLabel="Add New College"
                  />
                )}
                {errors.college && (
                  <p className="mt-2 text-sm text-red-600">{errors.college}</p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                {metaLoading ? (
                  <Skeleton variant="rect" width="100%" height={38} className="mb-2" />
                ) : (
                  <Select
                    name="semester"
                    options={createOptions(semesters)}
                    value={formData.semester ? { value: formData.semester, label: formData.semester } : null}
                    onChange={handleSelectChange}
                    styles={selectStyles}
                    placeholder="Select semester"
                    isClearable
                    className={errors.semester ? 'border-red-300 rounded-md' : ''}
                    components={{ MenuList: CustomMenuList }}
                    // @ts-ignore - Custom props
                    onAddNew={() => openAddModal('semesters', 'Semester')}
                    addNewLabel="Add New Semester"
                  />
                )}
                {errors.semester && (
                  <p className="mt-2 text-sm text-red-600">{errors.semester}</p>
                )}
              </div>

              {/* Course */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                {metaLoading ? (
                  <Skeleton variant="rect" width="100%" height={38} className="mb-2" />
                ) : (
                  <Select
                    name="course"
                    options={createOptions(courses)}
                    value={formData.course ? { value: formData.course, label: formData.course } : null}
                    onChange={handleSelectChange}
                    styles={selectStyles}
                    placeholder="Select course"
                    isClearable
                    className={errors.course ? 'border-red-300 rounded-md' : ''}
                    components={{ MenuList: CustomMenuList }}
                    // @ts-ignore - Custom props
                    onAddNew={() => openAddModal('courses', 'Course')}
                    addNewLabel="Add New Course"
                  />
                )}
                {errors.course && (
                  <p className="mt-2 text-sm text-red-600">{errors.course}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                {metaLoading ? (
                  <Skeleton variant="rect" width="100%" height={38} className="mb-2" />
                ) : (
                  <Select
                    name="subject"
                    options={createSubjectOptions()}
                    value={formData.subject ? { value: formData.subject, label: formData.subject } : null}
                    onChange={handleSelectChange}
                    styles={selectStyles}
                    placeholder="Select subject"
                    isClearable
                    className={errors.subject ? 'border-red-300 rounded-md' : ''}
                    components={{ MenuList: CustomMenuList }}
                    // @ts-ignore - Custom props
                    onAddNew={() => openAddModal('subjects', 'Subject')}
                    addNewLabel="Add New Subject"
                  />
                )}
                {errors.subject && (
                  <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              {/* Exam Type */}
              <div>
                <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type *
                </label>
                {metaLoading ? (
                  <Skeleton variant="rect" width="100%" height={38} className="mb-2" />
                ) : (
                  <Select
                    name="examType"
                    options={createOptions(examTypes)}
                    value={formData.examType ? { value: formData.examType, label: formData.examType } : null}
                    onChange={handleSelectChange}
                    styles={selectStyles}
                    placeholder="Select exam type"
                    isClearable
                    className={errors.examType ? 'border-red-300 rounded-md' : ''}
                    components={{ MenuList: CustomMenuList }}
                    // @ts-ignore - Custom props
                    onAddNew={() => openAddModal('examTypes', 'Exam Type')}
                    addNewLabel="Add New Exam Type"
                  />
                )}
                {errors.examType && (
                  <p className="mt-2 text-sm text-red-600">{errors.examType}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Add any additional details about the paper..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isUploading}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Paper'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {isUploading && (
        <div className="w-full max-w-lg mx-auto mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-primary-600 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}%</div>
        </div>
      )}

      <AddOptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Upload;