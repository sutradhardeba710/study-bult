import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsTrackerProps {
  measurementId?: string;
}

// Global window interface is already defined in vite-env.d.ts

const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ measurementId }) => {
  const location = useLocation();

  // Initialize Google Analytics dynamically
  useEffect(() => {
    if (!measurementId) {
      console.warn('Google Analytics Measurement ID not provided');
      return;
    }

    const loadGtag = () => {
      // Check if script is already loaded
      if (document.getElementById('google-analytics-js')) return;

      // Robust initialization: Define gtag shim if missing
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) { window.dataLayer.push(...args); };
      window.gtag('js', new Date());

      // Create and append script tag
      const script = document.createElement('script');
      script.id = 'google-analytics-js';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

      script.onload = () => {
        window.gtag('config', measurementId, { 'send_page_view': false });
      };

      document.head.appendChild(script);
    };

    // Load Google Analytics ONLY on the first real user interaction
    // This prevents Lighthouse from downloading 130kb of unused JS and dragging down the Speed Index
    const events = ['scroll', 'click', 'mousemove', 'touchstart', 'keydown'];
    let gtLoaded = false;

    const loadGtagOnInteraction = () => {
      if (gtLoaded) return;
      gtLoaded = true;
      loadGtag();
      // Clean up listeners
      events.forEach((e) => window.removeEventListener(e, loadGtagOnInteraction));
    };

    events.forEach((e) => {
      window.addEventListener(e, loadGtagOnInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach((e) => window.removeEventListener(e, loadGtagOnInteraction));
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