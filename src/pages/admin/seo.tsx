import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import SEODashboard from '../../components/admin/SEODashboard';
import { useSEO } from '../../hooks/useSEO';

const AdminSEO = () => {
  const { userProfile } = useAuth();

  useSEO({
    title: 'SEO Dashboard - StudyVault Admin',
    description: 'Monitor search performance, analyze SEO metrics, and optimize StudyVault for better search visibility.',
    noIndex: true // Don't index admin pages
  });

  // Check if user is admin
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <SEODashboard />
        </main>
      </div>
    </div>
  );
};

export default AdminSEO; 