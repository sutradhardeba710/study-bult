import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import CustomSelect from '../CustomSelect';
import { getMetaItems, type MetaItem } from '../../services/meta';
import { updatePaper } from '../../services/papers';
import type { PaperData } from '../../services/upload';

interface EditPaperModalProps {
    isOpen: boolean;
    onClose: () => void;
    paper: PaperData | null;
    onSaveSuccess: () => void;
}

const EditPaperModal: React.FC<EditPaperModalProps> = ({ isOpen, onClose, paper, onSaveSuccess }) => {
    const [editForm, setEditForm] = useState({
        title: '',
        subject: '',
        course: '',
        semester: '',
        college: '',
        examType: '',
        description: '',
    });
    const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [editLoading, setEditLoading] = useState(false);

    // Meta data states
    const [subjects, setSubjects] = useState<MetaItem[]>([]);
    const [courses, setCourses] = useState<MetaItem[]>([]);
    const [semesters, setSemesters] = useState<MetaItem[]>([]);
    const [colleges, setColleges] = useState<MetaItem[]>([]);
    const [examTypes, setExamTypes] = useState<MetaItem[]>([]);
    const [metaLoading, setMetaLoading] = useState(false);

    // Initialize form when paper changes
    useEffect(() => {
        if (paper && isOpen) {
            setEditForm({
                title: paper.title || '',
                subject: paper.subject || '',
                course: paper.course || '',
                semester: paper.semester || '',
                college: paper.college || '',
                examType: paper.examType || '',
                description: paper.description || '',
            });
            setEditStatus(paper.status || 'pending');
            fetchMeta();
        }
    }, [paper, isOpen]);

    const fetchMeta = async () => {
        setMetaLoading(true);
        try {
            const [fetchedSubjects, fetchedCourses, fetchedSemesters, fetchedColleges, fetchedExamTypes] = await Promise.all([
                getMetaItems('subjects'),
                getMetaItems('courses'),
                getMetaItems('semesters'),
                getMetaItems('colleges'),
                getMetaItems('examTypes'),
            ]);
            setSubjects(fetchedSubjects);
            setCourses(fetchedCourses);
            setSemesters(fetchedSemesters);
            setColleges(fetchedColleges);
            setExamTypes(fetchedExamTypes);
        } catch (err) {
            console.error('Failed to load meta options', err);
            toast.error('Failed to load form options');
        } finally {
            setMetaLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paper?.id) return;

        setEditLoading(true);
        try {
            await updatePaper(paper.id, {
                ...editForm,
                status: editStatus,
            });
            toast.success('Paper details updated successfully!');
            onSaveSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to update paper', err);
            toast.error('Failed to update paper');
        } finally {
            setEditLoading(false);
        }
    };

    if (!isOpen || !paper) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] relative flex flex-col overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center text-primary-700 break-words">
                    Edit Paper
                </h2>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                            name="title"
                            value={editForm.title}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Title"
                            required
                        />
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
                            value={editForm.subject ? { value: editForm.subject, label: editForm.subject } : null}
                            onChange={option => setEditForm(f => ({ ...f, subject: option ? option.value : '' }))}
                            isLoading={metaLoading}
                            placeholder={metaLoading ? 'Loading subjects...' : 'Select Subject'}
                            isClearable
                            required
                        />
                        <Select
                            classNamePrefix="react-select"
                            options={courses.map(c => ({ value: c.name, label: c.name }))}
                            value={editForm.course ? { value: editForm.course, label: editForm.course } : null}
                            onChange={option => setEditForm(f => ({ ...f, course: option ? option.value : '' }))}
                            isLoading={metaLoading}
                            placeholder={metaLoading ? 'Loading courses...' : 'Select Course'}
                            isClearable
                            required
                        />
                        <Select
                            classNamePrefix="react-select"
                            options={semesters.map(s => ({ value: s.name, label: s.name }))}
                            value={editForm.semester ? { value: editForm.semester, label: editForm.semester } : null}
                            onChange={option => setEditForm(f => ({ ...f, semester: option ? option.value : '' }))}
                            isLoading={metaLoading}
                            placeholder={metaLoading ? 'Loading semesters...' : 'Select Semester'}
                            isClearable
                            required
                        />
                        <Select
                            classNamePrefix="react-select"
                            options={colleges.map(c => ({ value: c.name, label: c.name }))}
                            value={editForm.college ? { value: editForm.college, label: editForm.college } : null}
                            onChange={option => setEditForm(f => ({ ...f, college: option ? option.value : '' }))}
                            isLoading={metaLoading}
                            placeholder={metaLoading ? 'Loading colleges...' : 'Select College'}
                            isClearable
                            required
                        />
                        <Select
                            classNamePrefix="react-select"
                            options={examTypes.map(type => ({ value: type.name, label: type.name }))}
                            value={editForm.examType ? { value: editForm.examType, label: editForm.examType } : null}
                            onChange={option => setEditForm(f => ({ ...f, examType: option ? option.value : '' }))}
                            isLoading={metaLoading}
                            placeholder={metaLoading ? 'Loading exam types...' : 'Select Exam Type'}
                            isClearable
                            required
                        />
                    </div>

                    <textarea
                        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                        name="description"
                        value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description (optional)"
                        rows={3}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <CustomSelect
                            value={editStatus}
                            onChange={val => setEditStatus(val as any)}
                            required
                            options={[
                                { value: 'pending', label: 'Pending', emoji: '⏳', badgeClass: 'bg-yellow-50' },
                                { value: 'approved', label: 'Approved', emoji: '✅', badgeClass: 'bg-green-50' },
                                { value: 'rejected', label: 'Rejected', emoji: '❌', badgeClass: 'bg-red-50' },
                            ]}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                            disabled={editLoading}
                        >
                            {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPaperModal;
