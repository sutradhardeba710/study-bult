import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getMetaItems, addMetaItem, updateMetaItem, deleteMetaItem, approveMetaItem, reorderMetaItems, type MetaType, type MetaItem } from '../../services/meta';
import { useMeta } from '../../context/MetaContext';
import toast from 'react-hot-toast';
import { PanelLeft, GripVertical, Check, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { createPortal } from 'react-dom';

const metaTypes: { type: MetaType; label: string }[] = [
  { type: 'subjects', label: 'Subjects' },
  { type: 'semesters', label: 'Semesters' },
  { type: 'courses', label: 'Courses' },
  { type: 'colleges', label: 'Colleges' },
  { type: 'examTypes', label: 'Exam Types' },
];

interface SortableRowProps {
  item: MetaItem;
  editId: string | null;
  editName: string;
  setEditName: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  loading: boolean;
  handleUpdate: () => void;
  setEditId: (id: string | null) => void;
  handleEdit: (item: MetaItem) => void;
  handleDelete: (id: string) => void;
  handleApprove: (id: string) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  item,
  editId,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  loading,
  handleUpdate,
  setEditId,
  handleEdit,
  handleDelete,
  handleApprove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isPending = item.status === 'pending';

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group hover:bg-gray-50 transition-colors ${isDragging ? 'bg-gray-100' : 'bg-white'} ${isPending ? 'bg-yellow-50' : ''}`}
    >
      <td className="px-2 py-2 align-middle w-[40px]">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors touch-none"
          title="Drag to reorder"
        >
          <GripVertical size={20} />
        </button>
      </td>
      <td className="px-4 py-2 align-middle whitespace-nowrap">
        {editId === item.id ? (
          <input
            type="text"
            className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            disabled={loading}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{item.name}</span>
            {isPending && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Pending
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-2 align-middle">
        {editId === item.id ? (
          <input
            type="text"
            className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            disabled={loading}
          />
        ) : (
          <span className="text-gray-600">{item.description}</span>
        )}
      </td>
      <td className="px-4 py-2 align-middle w-[200px]">
        {editId === item.id ? (
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-xs rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              onClick={handleUpdate}
              disabled={loading}
            >
              Save
            </button>
            <button
              className="px-3 py-1 text-xs rounded font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
              onClick={() => setEditId(null)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex space-x-2 items-center">
            {isPending && (
              <>
                <button
                  className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors shadow-sm"
                  onClick={() => handleApprove(item.id!)}
                  disabled={loading}
                  title="Approve"
                >
                  <Check size={16} />
                </button>
                <button
                  className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors shadow-sm"
                  onClick={() => handleDelete(item.id!)}
                  disabled={loading}
                  title="Reject"
                >
                  <X size={16} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
              </>
            )}
            <button
              className="px-3 py-1 text-xs rounded font-semibold bg-yellow-400 text-white hover:bg-yellow-500 transition-colors shadow-sm"
              onClick={() => handleEdit(item)}
              disabled={loading}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 text-xs rounded font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              onClick={() => handleDelete(item.id!)}
              disabled={loading}
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

// Separate component for the drag overlay to keep it clean
const DragOverlayRow: React.FC<{ item: MetaItem }> = ({ item }) => (
  <div className="flex items-center bg-white shadow-xl rounded-lg border border-gray-200 p-3 opacity-90 cursor-grabbing w-full max-w-md">
    <div className="p-2 text-gray-600 mr-2">
      <GripVertical size={20} />
    </div>
    <div className="flex-1">
      <div className="font-bold text-gray-800">{item.name}</div>
      {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
    </div>
  </div>
);

const AdminMeta: React.FC = () => {
  const [activeType, setActiveType] = useState<MetaType>('subjects');
  const [items, setItems] = useState<MetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const { refreshMeta } = useMeta();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts to prevent accidental clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchItems = async (type: MetaType) => {
    setLoading(true);
    try {
      const data = await getMetaItems(type);
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      toast.error('Failed to fetch items: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeType);
    setNewName('');
    setEditId(null);
    setEditName('');
    setEditDescription('');
  }, [activeType]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      // Admin added items are auto-approved
      await addMetaItem(activeType, newName.trim(), undefined, undefined, true);
      toast.success('Added!');
      setNewName('');
      fetchItems(activeType);
      await refreshMeta();
    } catch (error) {
      console.error('Failed to add:', error);
      toast.error('Failed to add: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MetaItem) => {
    setEditId(item.id!);
    setEditName(item.name);
    setEditDescription(item.description || '');
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !editId) return;
    setLoading(true);
    try {
      await updateMetaItem(activeType, editId, editName.trim(), editDescription.trim());
      toast.success('Updated!');
      setEditId(null);
      setEditName('');
      setEditDescription('');
      fetchItems(activeType);
      await refreshMeta();
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error('Failed to update: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    setLoading(true);
    try {
      await deleteMetaItem(activeType, id);
      toast.success('Deleted!');
      fetchItems(activeType);
      await refreshMeta();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await approveMetaItem(activeType, id);
      toast.success('Approved!');
      fetchItems(activeType);
      await refreshMeta();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems); // Optimistic update

      // Persist order
      try {
        await reorderMetaItems(activeType, newItems);
        // Silent success or maybe a small indicator
      } catch (error) {
        console.error('Failed to save order:', error);
        toast.error('Failed to save new order');
        // Revert on failure
        fetchItems(activeType);
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Subjects & Meta</h1>
          <div className="mb-6 flex flex-wrap gap-2 sm:gap-4">
            {metaTypes.map(({ type, label }) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeType === type ? 'bg-primary-600 text-white shadow-md transform scale-105' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                onClick={() => setActiveType(type)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6 flex space-x-3">
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                placeholder={`Add new ${activeType.slice(0, -1)}`}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                disabled={loading}
              />
              <button
                className="px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                onClick={handleAdd}
                disabled={loading || !newName.trim()}
              >
                Add Item
              </button>
              {items.filter(i => i.status === 'pending').length > 0 && (
                <div className="flex items-center ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                  <span className="mr-1 font-bold">{items.filter(i => i.status === 'pending').length}</span>
                  Pending Approval
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No items found. Add one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40px]"></th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[200px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <SortableContext
                        items={items.map(item => item.id!)}
                        strategy={verticalListSortingStrategy}
                      >
                        {items.map((item) => (
                          <SortableRow
                            key={item.id}
                            item={item}
                            editId={editId}
                            editName={editName}
                            setEditName={setEditName}
                            editDescription={editDescription}
                            setEditDescription={setEditDescription}
                            loading={loading}
                            handleUpdate={handleUpdate}
                            setEditId={setEditId}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            handleApprove={handleApprove}
                          />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                  {createPortal(
                    <DragOverlay dropAnimation={dropAnimation} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
                      {activeItem ? <DragOverlayRow item={activeItem} /> : null}
                    </DragOverlay>,
                    document.body
                  )}
                </DndContext>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMeta;