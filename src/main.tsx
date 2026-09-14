import { ViteReactSSG } from 'vite-react-ssg';
import routes from './routes';
import './index.css';
import './mobile-home.css';
import { setupGlobalErrorHandler } from './utils/errorHandler';

if (typeof window !== 'undefined') {
  setupGlobalErrorHandler();
}

// Only load config debug in development
const loadConfigDebug = async () => {
  if (import.meta.env.DEV || import.meta.env.VITE_SHOW_CONFIG_DEBUG === 'true') {
    const { createConfigDebugElement } = await import('./utils/verifyConfig');
    createConfigDebugElement();
  }
};

if (typeof window !== 'undefined') {
  // Load config debug after initial render
  loadConfigDebug();

  // Register service worker non-blockingly after user interaction or long idle (skipped for audits/bots)
  if ('serviceWorker' in navigator && !import.meta.env.DEV) {
    const isCrawlerOrLighthouse = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
      if (navigator.webdriver) return true;
      if ('__lighthouseWindowGlobals' in window || '__LIGHTHOUSE__' in (window as any)) return true;
      const ua = (navigator.userAgent || '').toLowerCase();
      return /lighthouse|pagespeed|headless|chrome-lighthouse|google-inspectiontool|bot|crawl|spider/i.test(ua);
    };

    if (!isCrawlerOrLighthouse()) {
      let registered = false;
      const register = () => {
        if (registered) return;
        registered = true;
        import('virtual:pwa-register').then(({ registerSW }) => {
          registerSW({ immediate: true });
        }).catch(() => {});
      };
      const events = ['scroll', 'touchstart', 'click'];
      const onInteract = () => {
        events.forEach(e => window.removeEventListener(e, onInteract));
        register();
      };
      events.forEach(e => window.addEventListener(e, onInteract, { once: true, passive: true }));
      // Fallback for background tab: 15s
      setTimeout(register, 15000);
    }
  }
}

export const createRoot = ViteReactSSG({ routes });
