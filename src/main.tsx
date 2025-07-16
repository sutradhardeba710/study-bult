import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createConfigDebugElement } from './utils/verifyConfig';

// Verify Firebase configuration in development or when debug is enabled
if (import.meta.env.DEV || import.meta.env.VITE_SHOW_CONFIG_DEBUG === 'true') {
  createConfigDebugElement();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
