import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addMetaItem, type MetaType } from '../services/meta';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface AddOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: MetaType;
    onSuccess: (newItemName: string) => void;
    title: string;
}

const AddOptionModal: React.FC<AddOptionModalProps> = ({ isOpen, onClose, type, onSuccess, title }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const { userProfile } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const isAdmin = userProfile?.role === 'admin';
            await addMetaItem(
                type,
                name.trim(),
                type === 'subjects' ? category.trim() : undefined,
                userProfile?.uid,
                isAdmin
            );

            if (isAdmin) {
                toast.success(`${title} added successfully`);
            } else {
                toast.success(`${title} added and pending approval. You can use it now.`);
            }

            onSuccess(name.trim());
            setName('');
            setCategory('');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-4">Add New {title}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder={`Enter ${title.toLowerCase()} name`}
                            required
                            autoFocus
                        />
                    </div>

                    {type === 'subjects' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category (Optional)
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                placeholder="e.g., Science, Arts, Engineering"
                                list="categories"
                            />
                            <datalist id="categories">
                                <option value="Agriculture & Allied Sciences" />
                                <option value="Arts / Humanities" />
                                <option value="Science" />
                                <option value="Commerce & Management" />
                                <option value="Engineering & Technology" />
                                <option value="Medical & Health Sciences" />
                                <option value="Law" />
                            </datalist>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOptionModal;
