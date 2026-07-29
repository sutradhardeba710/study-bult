import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHome from './dashboard/DashboardHome';
import MyUploads from './dashboard/MyUploads';
import UploadPaper from './dashboard/UploadPaper';
import LikedPapers from './dashboard/LikedPapers';
import Settings from './dashboard/Settings';
import Rewards from './dashboard/Rewards';
import Leaderboard from './dashboard/Leaderboard';
import Earnings from './dashboard/Earnings';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import NotificationsPanel from '../components/NotificationsPanel';

/* Map pathname → human-readable page title */
function usePageTitle() {
  const { pathname } = useLocation();
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/upload': 'Upload Paper',
    '/dashboard/my-uploads': 'My Uploads',
    '/dashboard/likes': 'Liked Papers',
    '/dashboard/rewards': 'Rewards',
    '/dashboard/leaderboard': 'Leaderboard',
    '/dashboard/earnings': 'Earnings',
    '/dashboard/settings': 'Settings',
  };
  return map[pathname] ?? 'Dashboard';
}

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = usePageTitle();

  /* Lock body scroll when sidebar drawer is open on mobile */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="flex flex-col md:flex-row min-h-screen max-w-[1600px] mx-auto relative">

        {/* ── Mobile top bar (hidden on md+) ── */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Hamburger */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open dashboard menu"
            >
              <Menu className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </button>

            {/* Page title */}
            <span className="font-bold text-slate-800 text-base tracking-tight">{pageTitle}</span>

            {/* Notification bell */}
            <NotificationsPanel />
          </div>
        </header>

        {/* ── Backdrop overlay ── */}
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          style={{
            opacity: sidebarOpen ? 1 : 0,
            pointerEvents: sidebarOpen ? 'auto' : 'none',
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* ── Sidebar (desktop: static, mobile: left-slide drawer) ── */}
        <div
          className={`fixed inset-y-0 left-0 z-50 md:static md:p-6 md:pr-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          style={{ width: '17rem' }}
        >
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 p-4 pb-10 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="my-uploads" element={<MyUploads />} />
            <Route path="upload" element={<UploadPaper />} />
            <Route path="likes" element={<LikedPapers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="earnings" element={<Earnings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
