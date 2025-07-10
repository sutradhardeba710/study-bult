import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Upload, 
  FolderOpen, 
  Heart, 
  Settings, 
  LogOut,
  User,
  BookOpen 
} from 'lucide-react';
import React from 'react';

const DashboardSidebar = ({ onClose }: { onClose?: () => void }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Upload Paper', href: '/dashboard/upload', icon: Upload },
    { name: 'My Uploads', href: '/dashboard/uploads', icon: FolderOpen },
    { name: 'Liked Papers', href: '/dashboard/likes', icon: Heart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-64 bg-white border border-gray-200 shadow rounded-xl min-h-screen flex flex-col p-4">
      {/* Close button for mobile */}
      {onClose && (
        <button
          className="md:hidden absolute top-4 right-4 z-50 bg-gray-100 rounded-full p-2"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {/* Logo */}
      <div className="pb-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">StudyVault</span>
        </Link>
      </div>
      {/* User Profile */}
      <div className="py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {userProfile?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {userProfile?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="py-4 flex-1">
        <ul className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar; 