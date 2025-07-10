import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Error404: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-primary-600" />
      </div>
      <h1 className="text-5xl font-bold text-primary-700 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.<br />
        You can return to the home page or browse papers below.
      </p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary px-6 py-2 rounded font-semibold">Home</Link>
        <Link to="/browse" className="btn-secondary px-6 py-2 rounded font-semibold">Browse Papers</Link>
      </div>
    </div>
  </div>
);

export default Error404; 