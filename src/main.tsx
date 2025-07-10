import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as Sentry from '@sentry/react';
// TODO: Replace 'https://examplePublicKey@o0.ingest.sentry.io/0' with your actual Sentry DSN
Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0, // Adjust for production
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
