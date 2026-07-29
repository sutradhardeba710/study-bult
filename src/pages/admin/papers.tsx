import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getPapers, deletePaperById } from '../../services/papers';
import { approvePaperWithCoins, rejectPaperReview } from '../../services/coins';
import { uploadPaper } from '../../services/upload';
import type { PaperData } from '../../services/upload';
import { getMetaItems, type MetaItem } from '../../services/meta';
import toast from 'react-hot-toast';
import { PanelLeft } from 'lucide-react';
import Select from 'react-select';
import PDFThumbnail from '../../components/PDFThumbnail';
import { functions } from '../../services/firebase';
import { httpsCallable } from 'firebase/functions';
import EditPaperModal from '../../components/admin/EditPaperModal';

const initialForm = {
  title: '',
  subject: '',
  course: '',
  semester: '',
  college: '',
  examType: '',
  description: '',
  file: null as File | null,
};

const AdminPapers: React.FC = () => {
  const location = useLocation();
  const isPendingView = location.pathname.includes('/admin/pending');
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PaperData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<MetaItem[]>([]);
  const [courses, setCourses] = useState<MetaItem[]>([]);
  const [semesters, setSemesters] = useState<MetaItem[]>([]);
  const [colleges, setColleges] = useState<MetaItem[]>([]);
  const [examTypes, setExamTypes] = useState<MetaItem[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [regeneratingThumbnails, setRegeneratingThumbnails] = useState<Set<string>>(new Set());

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const filter = isPendingView ? { status: 'pending' as const } : {};
      const allPapers = await getPapers(filter, 100);
      setPapers(allPapers);
    } catch (error) {
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
    // Fetch meta options
    const fetchMeta = async () => {
      setMetaLoading(true);
      try {
        const [subjects, courses, semesters, colleges, examTypes] = await Promise.all([
          getMetaItems('subjects'),
          getMetaItems('courses'),
          getMetaItems('semesters'),
          getMetaItems('colleges'),
          getMetaItems('examTypes'),
        ]);
        setSubjects(subjects);
        setCourses(courses);
        setSemesters(semesters);
        setColleges(colleges);
        setExamTypes(examTypes);
      } catch (err) {
        toast.error('Failed to load meta options');
      } finally {
        setMetaLoading(false);
      }
    };
    fetchMeta();
  }, [isPendingView]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve');
    try {
      await approvePaperWithCoins(id);
      toast.success('Paper approved · eligible coins processed');
      fetchPapers();
    } catch {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject');
    try {
      await rejectPaperReview(id);
      toast.success('Paper rejected');
      fetchPapers();
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this paper?')) return;
    setActionLoading(id + '-delete');
    try {
      await deletePaperById(id);
      toast.success('Paper deleted');
      fetchPapers();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin add paper form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };
  const handleAddPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) {
      toast.error('Please select a PDF file');
      return;
    }
    setUploading(true);
    try {
      // Simulate admin as uploader
      const paperData = {
        title: form.title,
        subject: form.subject,
        course: form.course,
        semester: form.semester,
        college: form.college,
        examType: form.examType,
        description: form.description,
        uploaderType: 'registered' as const,
        uploaderId: 'admin-demo',
        uploaderName: 'Admin',
        status: 'approved' as const,
      };
      await uploadPaper(form.file, paperData);
      toast.success('Paper added!');
      setForm(initialForm);
      fetchPapers();
    } catch (err) {
      toast.error('Failed to add paper');
    } finally {
      setUploading(false);
    }
  };

  function handleViewPaper(paper: PaperData) {
    setSelectedPaper(paper);
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
    setSelectedPaper(null);
  }

  function handleEditPaper(paper: PaperData) {
    setSelectedPaper(paper);
    setIsEditModalOpen(true);
  }
  function closeEditModal() {
    setIsEditModalOpen(false);
    setSelectedPaper(null);
  }

  // Bulk selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(papers.map(p => p.id!));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  // Bulk approve/reject handlers
  const handleBulkApprove = async () => {
    setBulkLoading('approve');
    try {
      await Promise.all(selectedIds.map(id => approvePaperWithCoins(id)));
      toast.success('Selected papers approved · eligible coins processed');
      setSelectedIds([]);
      fetchPapers();
    } catch {
      toast.error('Failed to bulk approve papers');
    } finally {
      setBulkLoading(null);
    }
  };

  const handleBulkReject = async () => {
    setBulkLoading('reject');
    try {
      await Promise.all(selectedIds.map(id => rejectPaperReview(id)));
      toast.success('Selected papers rejected');
      setSelectedIds([]);
      fetchPapers();
    } catch {
      toast.error('Failed to bulk reject papers');
    } finally {
      setBulkLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete all selected papers? This action cannot be undone.')) return;
    setBulkLoading('delete');
    try {
      await Promise.all(selectedIds.map(id => deletePaperById(id)));
      toast.success('Selected papers deleted');
      setSelectedIds([]);
      fetchPapers();
    } catch {
      toast.error('Failed to bulk delete papers');
    } finally {
      setBulkLoading(null);
    }
  };

  // Thumbnail regeneration handlers
  const handleRegenerateThumbnail = async (paperId: string) => {
    if (!functions) {
      toast.error('Firebase Functions not available');
      return;
    }

    setRegeneratingThumbnails(prev => new Set(prev).add(paperId));
    const regenerate = httpsCallable(functions, 'regenerateThumbnail');

    try {
      await regenerate({ paperId });
      toast.success('Thumbnail regenerated successfully!');
      fetchPapers(); // Refresh to show updated thumbnail
    } catch (error: any) {
      console.error('Error regenerating thumbnail:', error);
      const errorMessage = error.message || error.code || 'Failed to regenerate thumbnail';
      toast.error(errorMessage);
    } finally {
      setRegeneratingThumbnails(prev => {
        const next = new Set(prev);
        next.delete(paperId);
        return next;
      });
    }
  };

  const handleBulkRegenerateThumbnails = async () => {
    if (!functions) {
      toast.error('Firebase Functions not available');
      return;
    }

    // Filter selected papers that don't have thumbnails
    const papersToRegenerate = papers.filter(p =>
      selectedIds.includes(p.id!)
    );

    if (papersToRegenerate.length === 0) {
      toast.error('No papers selected');
      return;
    }

    if (!window.confirm(`Regenerate thumbnails for ${papersToRegenerate.length} papers?`)) return;

    const regenerate = httpsCallable(functions, 'regenerateThumbnail');
    let successCount = 0;
    let failCount = 0;

    for (const paper of papersToRegenerate) {
      setRegeneratingThumbnails(prev => new Set(prev).add(paper.id!));
      try {
        await regenerate({ paperId: paper.id });
        successCount++;
      } catch (error: any) {
        console.error(`Error regenerating thumbnail for ${paper.id}:`, error);
        failCount++;
      } finally {
        setRegeneratingThumbnails(prev => {
          const next = new Set(prev);
          next.delete(paper.id!);
          return next;
        });
      }
    }

    toast.success(`Regenerated ${successCount} thumbnails${failCount > 0 ? `, ${failCount} failed` : ''}`);
    fetchPapers(); // Refresh to show updated thumbnails
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open admin menu"
        title="Open admin menu"
      >
        <PanelLeft className="w-6 h-6 text-gray-700" />
      </button>
      <div className="flex flex-col md:flex-row">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-2 sm:p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
          <h1 className="text-2xl font-bold mb-6">{isPendingView ? 'Pending Papers Review' : 'Manage All Papers'}</h1>
          {/* Add Paper Form - Only show on All Papers */}
          {!isPendingView && (
            <form className="bg-white rounded-lg shadow p-6 mb-8 space-y-4" onSubmit={handleAddPaper}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="border rounded px-3 py-2" name="title" value={form.title} onChange={handleFormChange} placeholder="Title" required />
                <Select
                  classNamePrefix="react-select"
                  options={Object.entries(
                    subjects.reduce((acc, subject) => {
                      const category = subject.category || 'Other';
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(subject);
                      return acc;
                    }, {} as Record<string, MetaItem[]>)
                  ).map(([category, categorySubjects]) => ({
                    label: category,
                    options: categorySubjects.map(s => ({ value: s.name, label: s.name }))
                  }))}
                  value={form.subject ? { value: form.subject, label: form.subject } : null}
                  onChange={option => setForm(prev => ({ ...prev, subject: option ? option.value : '' }))}
                  isLoading={metaLoading}
                  placeholder={metaLoading ? 'Loading subjects...' : 'Select Subject'}
                  isClearable
                  required
                />
                <Select
                  classNamePrefix="react-select"
                  options={courses.map(c => ({ value: c.name, label: c.name }))}
                  value={form.course ? { value: form.course, label: form.course } : null}
                  onChange={option => setForm(prev => ({ ...prev, course: option ? option.value : '' }))}
                  isLoading={metaLoading}
                  placeholder={metaLoading ? 'Loading courses...' : 'Select Course'}
                  isClearable
                  required
                />
                <Select
                  classNamePrefix="react-select"
                  options={semesters.map(s => ({ value: s.name, label: s.name }))}
                  value={form.semester ? { value: form.semester, label: form.semester } : null}
                  onChange={option => setForm(prev => ({ ...prev, semester: option ? option.value : '' }))}
                  isLoading={metaLoading}
                  placeholder={metaLoading ? 'Loading semesters...' : 'Select Semester'}
                  isClearable
                  required
                />
                <Select
                  classNamePrefix="react-select"
                  options={colleges.map(c => ({ value: c.name, label: c.name }))}
                  value={form.college ? { value: form.college, label: form.college } : null}
                  onChange={option => setForm(prev => ({ ...prev, college: option ? option.value : '' }))}
                  isLoading={metaLoading}
                  placeholder={metaLoading ? 'Loading colleges...' : 'Select College'}
                  isClearable
                  required
                />
                <Select
                  classNamePrefix="react-select"
                  options={examTypes.map(type => ({ value: type.name, label: type.name }))}
                  value={form.examType ? { value: form.examType, label: form.examType } : null}
                  onChange={option => setForm(prev => ({ ...prev, examType: option ? option.value : '' }))}
                  isLoading={metaLoading}
                  placeholder={metaLoading ? 'Loading exam types...' : 'Select Exam Type'}
                  isClearable
                  required
                />
              </div>
              <textarea className="border rounded px-3 py-2 w-full" name="description" value={form.description} onChange={handleFormChange} placeholder="Description (optional)" />
              <input type="file" accept=".pdf" onChange={handleFileChange} required />
              <button type="submit" className="btn-primary px-6 py-2" disabled={uploading}>{uploading ? 'Uploading...' : 'Add Paper'}</button>
            </form>
          )}
          {/* Table of papers */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Bulk action bar */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <button
                className="btn-primary px-4 py-2 disabled:opacity-50"
                disabled={selectedIds.length === 0 || bulkLoading === 'approve'}
                onClick={handleBulkApprove}
              >
                {bulkLoading === 'approve' ? 'Approving...' : 'Bulk Approve'}
              </button>
              <button
                className="btn-secondary px-4 py-2 disabled:opacity-50"
                disabled={selectedIds.length === 0 || bulkLoading === 'reject'}
                onClick={handleBulkReject}
              >
                {bulkLoading === 'reject' ? 'Rejecting...' : 'Bulk Reject'}
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={selectedIds.length === 0 || bulkLoading === 'delete'}
                onClick={handleBulkDelete}
              >
                {bulkLoading === 'delete' ? 'Deleting...' : 'Bulk Delete'}
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={selectedIds.length === 0}
                onClick={handleBulkRegenerateThumbnails}
                title="Regenerate thumbnails for selected papers without them"
              >
                Regen Thumbnails
              </button>
              {selectedIds.length > 0 && (
                <span className="ml-2 text-sm text-gray-500">{selectedIds.length} selected</span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : papers.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No papers found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-0 min-w-[40px] text-left align-top">
                        <label className="flex items-center gap-5 cursor-pointer w-full h-full p-2">
                          <input
                            type="checkbox"
                            checked={papers.length > 0 && selectedIds.length === papers.length}
                            onChange={handleSelectAll}
                            aria-label="Select all papers"
                            className="cursor-pointer"
                          />
                          <span className="text-xs font-medium text-gray-500 uppercase">Title</span>
                        </label>
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[80px]">Preview</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">Uploader</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px]">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px]">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[160px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {papers.map((paper) => (
                      <tr key={paper.id}>
                        <td className="p-0 text-left align-top h-[1px]">
                          <label className="flex items-center gap-5 cursor-pointer w-full h-full p-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(paper.id!)}
                              onChange={() => handleSelectOne(paper.id!)}
                              aria-label={`Select paper ${paper.title}`}
                              className="cursor-pointer"
                            />
                            <span className="whitespace-nowrap">{paper.title}</span>
                          </label>
                        </td>
                        <td className="px-4 py-2">
                          <div className="cursor-pointer" onClick={() => handleViewPaper(paper)}>
                            <PDFThumbnail
                              fileUrl={paper.fileUrl}
                              thumbnailUrl={paper.thumbnailUrl}
                              width={60}
                              height={80}
                              className="shadow-sm hover:shadow-md transition-shadow"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{paper.uploaderName}</span>
                            {paper.uploaderType === 'guest' && paper.uploaderEmail && (
                              <span className="text-xs text-gray-500 mt-0.5">📧 {paper.uploaderEmail}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${paper.uploaderType === 'guest'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {paper.uploaderType === 'guest' ? '👤 Guest' : '👥 Registered'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${paper.status === 'approved' ? 'bg-green-100 text-green-700' :
                            paper.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {paper.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
                            <button
                              className="px-3 py-1 text-xs rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              onClick={() => handleViewPaper(paper)}
                            >
                              View
                            </button>
                            <button
                              className="px-3 py-1 text-xs rounded font-semibold bg-yellow-400 text-white hover:bg-yellow-500 transition-colors"
                              onClick={() => handleEditPaper(paper)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-1 text-xs rounded font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                              onClick={() => handleDelete(paper.id!)}
                            >
                              Delete
                            </button>
                            <button
                              className="px-3 py-1 text-xs rounded font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                              onClick={() => handleRegenerateThumbnail(paper.id!)}
                              disabled={regeneratingThumbnails.has(paper.id!)}
                              title="Generate thumbnail for this paper"
                            >
                              {regeneratingThumbnails.has(paper.id!) ? 'Generating...' : 'Regen'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Paper View Modal */}
          {isModalOpen && selectedPaper && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] relative flex flex-col overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center text-primary-700 break-words">{selectedPaper.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Uploader</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-gray-800">{selectedPaper.uploaderName || selectedPaper.uploaderId}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedPaper.uploaderType === 'guest'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {selectedPaper.uploaderType === 'guest' ? 'Guest' : 'Registered'}
                      </span>
                    </div>
                    {selectedPaper.uploaderType === 'guest' && selectedPaper.uploaderEmail && (
                      <span className="text-sm text-gray-600 mt-1">📧 {selectedPaper.uploaderEmail}</span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Subject</span>
                    <span className="text-base text-gray-800">{selectedPaper.subject}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Course</span>
                    <span className="text-base text-gray-800">{selectedPaper.course}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Semester</span>
                    <span className="text-base text-gray-800">{selectedPaper.semester}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">College</span>
                    <span className="text-base text-gray-800">{selectedPaper.college}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Exam Type</span>
                    <span className="text-base text-gray-800">{selectedPaper.examType}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col sm:col-span-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Description</span>
                    <span className="text-base text-gray-800">{selectedPaper.description || <span className="italic text-gray-400">No description</span>}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Status</span>
                    <span className={`text-base font-semibold ${selectedPaper.status === 'approved' ? 'text-green-600' :
                      selectedPaper.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{selectedPaper.status}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3 flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold uppercase mb-1">Uploaded At</span>
                    <span className="text-base text-gray-800">{selectedPaper.createdAt ? ((selectedPaper.createdAt as any).toDate ? (selectedPaper.createdAt as any).toDate().toLocaleString() : String(selectedPaper.createdAt)) : ''}</span>
                  </div>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="my-4 w-full flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-primary-700">PDF Preview</span>
                    {selectedPaper.fileUrl && (
                      <a
                        href={selectedPaper.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline ml-2"
                        download
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                  <div className="w-full h-[40vh] sm:h-[60vh] rounded border-2 border-primary-200 overflow-hidden bg-gray-100 shadow-inner">
                    {selectedPaper.fileUrl ? (
                      <iframe
                        src={selectedPaper.fileUrl}
                        title="Paper PDF"
                        width="100%"
                        height="100%"
                        className="w-full h-full min-h-[300px]"
                        style={{ minHeight: 300 }}
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No PDF available</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  {selectedPaper.status !== 'approved' && (
                    <button
                      className="btn-primary px-4 py-2 w-full sm:w-auto"
                      disabled={actionLoading === selectedPaper.id + '-approve'}
                      onClick={async () => {
                        await handleApprove(selectedPaper.id!);
                        closeModal();
                      }}
                    >
                      {actionLoading === selectedPaper.id + '-approve' ? '...' : 'Approve'}
                    </button>
                  )}
                  {selectedPaper.status !== 'rejected' && (
                    <button
                      className="btn-secondary px-4 py-2 w-full sm:w-auto"
                      disabled={actionLoading === selectedPaper.id + '-reject'}
                      onClick={async () => {
                        await handleReject(selectedPaper.id!);
                        closeModal();
                      }}
                    >
                      {actionLoading === selectedPaper.id + '-reject' ? '...' : 'Reject'}
                    </button>
                  )}
                  <button
                    className="btn px-4 py-2 w-full sm:w-auto"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <EditPaperModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            paper={selectedPaper}
            onSaveSuccess={fetchPapers}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminPapers;