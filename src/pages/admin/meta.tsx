import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getMetaItems, addMetaItem, updateMetaItem, deleteMetaItem, type MetaType, type MetaItem } from '../../services/meta';
import { useMeta } from '../../context/MetaContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { PanelLeft } from 'lucide-react';

const metaTypes: { type: MetaType; label: string }[] = [
  { type: 'subjects', label: 'Subjects' },
  { type: 'semesters', label: 'Semesters' },
  { type: 'courses', label: 'Courses' },
  { type: 'colleges', label: 'Colleges' },
  { type: 'examTypes', label: 'Exam Types' },
];

const AdminMeta: React.FC = () => {
  const [activeType, setActiveType] = useState<MetaType>('subjects');
  const [items, setItems] = useState<MetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const { refreshMeta } = useMeta();

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
      await addMetaItem(activeType, newName.trim());
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

  // Drag-and-drop handlers
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setItems(reordered);
    // Save new order to backend
    try {
      // Update order by updating each item with its new position
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].id) {
          await updateMetaItem(activeType, reordered[i].id!, reordered[i].name, reordered[i].description);
        }
      }
      toast.success('Order updated!');
      await refreshMeta();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

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
        <h1 className="text-2xl font-bold mb-6">Manage Subjects & Meta</h1>
          <div className="mb-6 flex flex-wrap gap-2 sm:gap-4">
          {metaTypes.map(({ type, label }) => (
            <button
              key={type}
              className={`px-4 py-2 rounded font-semibold ${activeType === type ? 'bg-primary-600 text-white' : 'bg-white text-primary-700 border border-primary-200'}`}
              onClick={() => setActiveType(type)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex space-x-2">
            <input
              type="text"
              className="border rounded px-3 py-2 w-64"
              placeholder={`Add new ${activeType.slice(0, -1)}`}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              disabled={loading}
            />
            <button className="btn-primary" onClick={handleAdd} disabled={loading || !newName.trim()}>Add</button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No items found.</div>
          ) : (
              <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                      <th className="px-2 py-2 min-w-[32px]"></th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px] whitespace-nowrap">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[140px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="meta-list">
                  {(provided) => (
                    <tbody className="bg-white divide-y divide-gray-200" ref={provided.innerRef} {...provided.droppableProps}>
                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id!} index={index}>
                          {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps} style={provided.draggableProps.style}>
                                  <td className="px-2 py-2 align-middle cursor-grab" {...provided.dragHandleProps}>
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </td>
                                  <td className="px-4 py-2 align-middle whitespace-nowrap">
                                {editId === item.id ? (
                                  <input
                                    type="text"
                                    className="border rounded px-2 py-1"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    disabled={loading}
                                  />
                                ) : (
                                  item.name
                                )}
                              </td>
                                  <td className="px-4 py-2 align-middle">
                                {editId === item.id ? (
                                  <input
                                    type="text"
                                    className="border rounded px-2 py-1"
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    disabled={loading}
                                  />
                                ) : (
                                      item.description ? item.description : <span className="text-gray-400 italic">No description</span>
                                )}
                              </td>
                                  <td className="px-4 py-2 align-middle whitespace-nowrap">
                                {editId === item.id ? (
                                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
                                        <button className="btn-primary px-2 py-1 text-xs" onClick={handleUpdate} disabled={loading}>Save</button>
                                        <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setEditId(null)} disabled={loading}>Cancel</button>
                                      </div>
                                ) : (
                                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-1">
                                        <button className="btn-secondary px-2 py-1 text-xs" onClick={() => handleEdit(item)} disabled={loading}>Edit</button>
                                        <button className="btn-danger px-2 py-1 text-xs" onClick={() => handleDelete(item.id!)} disabled={loading}>Delete</button>
                                      </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </DragDropContext>
            </table>
              </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminMeta; 