import React, { useEffect, useState } from 'react';

const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show offline banner at the top
  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white text-center py-2 shadow-md animate-fade-in">
          <span className="font-semibold">You are offline.</span> Some features may not work.
        </div>
      )}
      {showBackOnline && (
        <div className="fixed top-0 left-0 w-full z-50 bg-green-600 text-white text-center py-2 shadow-md animate-fade-in">
          <span className="font-semibold">You’re back online!</span>
        </div>
      )}
      {/* Spacer for fixed banner */}
      {(showBackOnline || !isOnline) && <div style={{ height: 40 }} />}
    </>
  );
};

export default NetworkStatusBanner; 