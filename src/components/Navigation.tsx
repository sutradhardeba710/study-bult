import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, Upload, BookOpen, Home, LogOut, Shield, Grid } from 'lucide-react';
import Button from './Button';

// Helper to render cropped avatar using canvas
function getCroppedAvatarUrl(imageUrl: string, crop: { x: number; y: number; width: number; height: number; zoom: number } | null | undefined, callback: (url: string) => void) {
  if (!imageUrl || !crop) {
    callback(imageUrl);
    return;
  }
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return callback(imageUrl);
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        callback(url);
      } else {
        callback(imageUrl);
      }
    }, 'image/jpeg', 0.95);
  };
  img.onerror = () => callback(imageUrl);
  img.src = imageUrl;
}

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    if (userProfile?.avatarOriginal && userProfile.avatarCrop) {
      getCroppedAvatarUrl(userProfile.avatarOriginal, userProfile.avatarCrop, setAvatarPreview);
    } else if (userProfile?.avatarOriginal) {
      setAvatarPreview(userProfile.avatarOriginal);
    } else {
      setAvatarPreview(undefined);
    }
  }, [userProfile?.avatarOriginal, JSON.stringify(userProfile?.avatarCrop ?? {})]);

  const navigation = [
    { name: 'Home', href: currentUser ? '/browse' : '/', icon: Home },
    ...(currentUser ? [{ name: 'Upload Paper', href: '/upload', icon: Upload }] : []),
    ...(currentUser ? [{ name: 'Dashboard', href: '/dashboard', icon: User }] : []),
    ...(userProfile?.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Shield }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StudyVault</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {userProfile ? (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {userProfile?.name || 'User'}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              className="text-gray-700 hover:text-primary-600 p-2 rounded-md"
              aria-label={isMobileMenuOpen ? 'Close global menu' : 'Open global menu'}
              title={isMobileMenuOpen ? 'Close global menu' : 'Open global menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Grid className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {currentUser ? (
                <>
                  <div className="px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {userProfile?.name || 'User'}
                      </span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="text-gray-700 hover:text-red-600 w-full text-left flex items-center space-x-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary block text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 