import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getAllUsers } from '../../services/users';
import { getPapersCount, getPendingPapersCount } from '../../services/papers';
import toast from 'react-hot-toast';
import { PanelLeft } from 'lucide-react';

const AdminHome: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, papers: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [users, papers, pending] = await Promise.all([
        getAllUsers().then(u => u.length),
        getPapersCount(),
        getPendingPapersCount(),
      ]);
      setStats({ users, papers, pending });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to fetch dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500">Total Users</div>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : stats.users}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500">Total Papers</div>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : stats.papers}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500">Pending Approvals</div>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : stats.pending}
            </div>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <a href="/admin/papers" className="block bg-primary-600 text-white rounded-lg p-6 text-center font-semibold hover:bg-primary-700 transition">Manage Papers</a>
          <a href="/admin/meta" className="block bg-primary-600 text-white rounded-lg p-6 text-center font-semibold hover:bg-primary-700 transition">Manage Subjects & Meta</a>
          <a href="/admin/users" className="block bg-primary-600 text-white rounded-lg p-6 text-center font-semibold hover:bg-primary-700 transition">Manage Users</a>
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminHome; 