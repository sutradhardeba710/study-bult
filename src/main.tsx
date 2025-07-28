import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandler } from './utils/errorHandler'

// Set up global error handling first
setupGlobalErrorHandler();

// Only load config debug in development
const loadConfigDebug = async () => {
  if (import.meta.env.DEV || import.meta.env.VITE_SHOW_CONFIG_DEBUG === 'true') {
    const { createConfigDebugElement } = await import('./utils/verifyConfig');
    createConfigDebugElement();
  }
};

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Render app immediately
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Load config debug after initial render
loadConfigDebug();
