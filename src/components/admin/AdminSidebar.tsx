import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PanelLeft, X } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/papers', label: 'Papers' },
  { to: '/admin/meta', label: 'Subjects & Meta' },
  { to: '/admin/users', label: 'Users' },

];

const AdminSidebar: React.FC<{ open?: boolean; onClose?: () => void }> = ({ open = true, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Sidebar overlay for mobile */}
      {onClose && (
        <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity md:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose}></div>
      )}
      {/* Sidebar */}
      <aside className={`fixed z-50 md:static md:block transition-transform duration-300 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 min-h-screen flex-col shadow-sm w-64 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Close button for mobile */}
        {onClose && (
          <button
            className="md:hidden absolute top-4 right-4 z-50 bg-gray-100 rounded-full p-2"
            onClick={onClose}
            aria-label="Close admin sidebar"
            title="Close admin sidebar"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div className="p-6 border-b border-gray-100 flex flex-col gap-3">
          <span className="text-2xl font-extrabold text-primary-700 tracking-tight">Admin Panel</span>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded hover:bg-blue-50 border border-blue-100 w-max bg-blue-50/50 shadow-sm"
          >
            <PanelLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Main Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 mt-6">
          <ul className="space-y-1 px-2">
            {links.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition text-base shadow-sm
                    hover:bg-primary-50 hover:text-primary-700
                    ${location.pathname === link.to ? 'bg-primary-100 text-primary-700 font-semibold ring-2 ring-primary-200' : 'text-gray-700'}`}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-4 text-xs text-gray-400 text-center border-t border-gray-100">Study Volte Admin &copy; {new Date().getFullYear()}</div>
      </aside>
    </>
  );
};

export default AdminSidebar; 