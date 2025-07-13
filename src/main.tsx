import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import Sentry but don't initialize it with the placeholder DSN
// Uncomment and configure with a real DSN when ready for production
// import * as Sentry from '@sentry/react';
// Sentry.init({
//   dsn: 'YOUR_ACTUAL_SENTRY_DSN',
//   integrations: [Sentry.browserTracingIntegration()],
//   tracesSampleRate: 0.2, // Lower for production
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
