import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHome from './dashboard/DashboardHome';
import MyUploads from './dashboard/MyUploads';
import UploadPaper from './dashboard/UploadPaper';
import LikedPapers from './dashboard/LikedPapers';
import Settings from './dashboard/Settings';
import { useState } from 'react';
import { PanelLeft } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open dashboard menu"
        title="Open dashboard menu"
      >
        <PanelLeft className="w-6 h-6 text-gray-700" />
      </button>
      <div className="flex flex-col md:flex-row">
        {/* Sidebar overlay for mobile */}
        <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className={`fixed z-50 md:static md:block transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{width: '16rem'}}>
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <main className="flex-1 p-2 sm:p-4 md:p-6 md:ml-0 md:mt-0">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/uploads" element={<MyUploads />} />
            <Route path="/upload" element={<UploadPaper />} />
            <Route path="/likes" element={<LikedPapers />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 