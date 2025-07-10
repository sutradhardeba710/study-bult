import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary-700">StudyVault</span>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-gray-600">
          <Link to="/about" className="hover:text-primary-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
        </nav>
        <div className="text-xs text-gray-400 text-center md:text-right">
          &copy; {new Date().getFullYear()} StudyVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 