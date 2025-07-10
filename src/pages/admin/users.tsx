import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllUsers, updateUser, deleteUser, type UserProfile } from '../../services/users';
import { getUserPapers, getUserDownloads, getUserLikeEvents } from '../../services/papers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { PanelLeft } from 'lucide-react';
import Select from 'react-select';

const AdminUsers: React.FC = () => {
  const { userProfile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUid, setEditUid] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activityUser, setActivityUser] = useState<UserProfile | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  // Activity modal state
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [uploads, setUploads] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch user activity when modal opens
  useEffect(() => {
    if (showActivityModal && activityUser) {
      setActivityLoading(true);
      setActivityError('');
      Promise.all([
        getUserPapers(activityUser.uid),
        getUserLikeEvents(activityUser.uid),
        getUserDownloads(activityUser.uid)
      ])
        .then(([uploads, likes, downloads]) => {
          setUploads(uploads);
          setLikes(likes);
          setDownloads(downloads);
        })
        .catch((err) => {
          setActivityError('Failed to load user activity.');
        })
        .finally(() => setActivityLoading(false));
    }
  }, [showActivityModal, activityUser]);

  const handleEdit = (user: UserProfile) => {
    setEditUid(user.uid);
    setEditData({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editUid) return;
    setLoading(true);
    try {
      await updateUser(editUid, editData);
      toast.success('User updated!');
      setEditUid(null);
      setEditData({});
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await deleteUser(uid);
      toast.success('User deleted!');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  // Placeholder for reset password
  const handleResetPassword = (user: UserProfile) => {
    toast.success(`Password reset link sent to ${user.email} (placeholder)`);
  };
  // Placeholder for view activity
  const handleViewActivity = (user: UserProfile) => {
    setActivityUser(user);
    setShowActivityModal(true);
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
        <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
        <div className="bg-white rounded-lg shadow p-2 sm:p-6">
          {/* Search and filter bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
            <Select
              classNamePrefix="react-select"
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'student', label: 'Student' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={{ value: roleFilter, label: roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) }}
              onChange={option => setRoleFilter(option ? option.value : 'all')}
              className="w-full md:w-48"
              isSearchable={false}
            />
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.uid}>
                      <td className="px-2 sm:px-4 py-2">{user.name}</td>
                      <td className="px-2 sm:px-4 py-2">{user.email}</td>
                      <td className="px-2 sm:px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>{user.role}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-2">{user.college}</td>
                      <td className="px-2 sm:px-4 py-2">{user.semester}</td>
                      <td className="px-2 sm:px-4 py-2">{user.course}</td>
                        <td className="px-2 sm:px-4 py-2 align-top">
                          <div className="flex flex-col gap-2 w-full">
                            <button className="btn-secondary px-3 py-1 text-xs w-full" onClick={() => handleEdit(user)} disabled={loading}>Edit</button>
                            <button className="btn-primary px-3 py-1 text-xs w-full" onClick={() => handleViewActivity(user)} disabled={loading}>View Activity</button>
                            <button className="btn-secondary px-3 py-1 text-xs w-full" onClick={() => handleResetPassword(user)} disabled={loading}>Reset Password</button>
                        {currentUser?.uid !== user.uid && (
                              <button className="btn-danger px-3 py-1 text-xs w-full" onClick={() => handleDelete(user.uid)} disabled={loading}>Delete</button>
                        )}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Edit User Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsEditModalOpen(false)}>
            <div
              className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-2 relative flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-center text-primary-700 break-words">Edit User</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={editData.name || ''}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={editData.role || 'student'}
                    onChange={e => setEditData({ ...editData, role: e.target.value as 'student' | 'admin' })}
                    disabled={loading}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={editData.college || ''}
                    onChange={e => setEditData({ ...editData, college: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={editData.semester || ''}
                    onChange={e => setEditData({ ...editData, semester: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full"
                    value={editData.course || ''}
                    onChange={e => setEditData({ ...editData, course: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2"
                    onClick={() => { setIsEditModalOpen(false); setEditUid(null); setEditData({}); }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Activity Modal */}
        {showActivityModal && activityUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowActivityModal(false)}>
              <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6 w-full max-w-full sm:max-w-lg mx-2 relative flex flex-col overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowActivityModal(false)} aria-label="Close">&times;</button>
              <h2 className="text-xl font-bold mb-4 text-center text-primary-700 break-words">User Activity</h2>
              <div className="mb-4 text-center text-gray-700 font-semibold">{activityUser.name} ({activityUser.email})</div>
              {activityLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
              ) : activityError ? (
                <div className="text-red-600 text-center py-4">{activityError}</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recent Uploads</h3>
                    {uploads.length === 0 ? <div className="text-gray-400 text-sm">No uploads found.</div> : (
                      <ul className="divide-y divide-gray-100">
                        {uploads.slice(0, 5).map((paper) => (
                          <li key={paper.id} className="py-1 flex flex-col">
                            <span className="font-medium text-gray-800">{paper.title}</span>
                            <span className="text-xs text-gray-500">{paper.status} &middot; {paper.createdAt && (paper.createdAt.toDate ? paper.createdAt.toDate().toLocaleDateString() : new Date(paper.createdAt).toLocaleDateString())}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recent Likes</h3>
                    {likes.length === 0 ? <div className="text-gray-400 text-sm">No likes found.</div> : (
                      <ul className="divide-y divide-gray-100">
                        {likes.slice(0, 5).map((like) => (
                          <li key={like.paperId} className="py-1 flex flex-col">
                            <span className="font-medium text-gray-800">{like.title}</span>
                            <span className="text-xs text-gray-500">{like.date && (like.date.toDate ? like.date.toDate().toLocaleDateString() : new Date(like.date).toLocaleDateString())}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Recent Downloads</h3>
                    {downloads.length === 0 ? <div className="text-gray-400 text-sm">No downloads found.</div> : (
                      <ul className="divide-y divide-gray-100">
                        {downloads.slice(0, 5).map((paper) => (
                          <li key={paper.id} className="py-1 flex flex-col">
                            <span className="font-medium text-gray-800">{paper.title}</span>
                            <span className="text-xs text-gray-500">{paper.createdAt && (paper.createdAt.toDate ? paper.createdAt.toDate().toLocaleDateString() : new Date(paper.createdAt).toLocaleDateString())}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default AdminUsers; 