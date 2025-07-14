import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsTrackerProps {
  measurementId?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ measurementId }) => {
  const location = useLocation();

  // Initialize Google Analytics
  useEffect(() => {
    if (!measurementId) {
      console.warn('Google Analytics Measurement ID not provided');
      return;
    }

    // Check if Google Analytics is already loaded
    if (document.getElementById('ga-script')) {
      return;
    }

    // Add Google Analytics script
    const script1 = document.createElement('script');
    script1.id = 'ga-script';
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', { 'send_page_view': false });
    `;
    
    document.head.appendChild(script1);
    document.head.appendChild(script2);
    
    return () => {
      // Clean up scripts when component unmounts
      const script1Element = document.getElementById('ga-script');
      const script2Element = document.getElementById('ga-script-init');
      if (script1Element) document.head.removeChild(script1Element);
      if (script2Element) document.head.removeChild(script2Element);
    };
  }, [measurementId]);

  // Track page views
  useEffect(() => {
    if (!measurementId || !window.gtag) return;
    
    window.gtag('config', measurementId, {
      page_path: location.pathname + location.search
    });
  }, [location, measurementId]);

  // This component doesn't render anything
  return null;
};

export default AnalyticsTracker; 