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
}

export const createRoot = ViteReactSSG({ routes });
