import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { testEmailConnection } from './services/email'
// Import Sentry but don't initialize it with the placeholder DSN
// Uncomment and configure with a real DSN when ready for production
// import * as Sentry from '@sentry/react';
// Sentry.init({
//   dsn: 'YOUR_ACTUAL_SENTRY_DSN',
//   integrations: [Sentry.browserTracingIntegration()],
//   tracesSampleRate: 0.2, // Lower for production
// });

// Test email connection on startup if email configuration is provided
if (import.meta.env.VITE_EMAIL_HOST && import.meta.env.VITE_EMAIL_USER) {
  testEmailConnection()
    .then(success => {
      if (success) {
        console.log('✅ Email service is configured and ready');
      } else {
        console.warn('⚠️ Email service connection test failed');
      }
    })
    .catch(error => {
      console.error('❌ Email service configuration error:', error);
    });
} else {
  console.warn('⚠️ Email service not configured. Email notifications will not be sent.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
