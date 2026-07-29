import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MetaProvider } from './context/MetaContext';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';

// Common
const UploadEncouragementModal = lazy(() => import('./components/UploadEncouragementModal'));

// Public layout parts
import Navigation from './components/Navigation';
import Footer from './components/Footer';
const AnalyticsTracker = lazy(() => import('./components/AnalyticsTracker'));
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));
const NetworkStatusBanner = lazy(() => import('./components/NetworkStatusBanner'));

const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX';

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50" aria-hidden="true">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mb-3"></div>
    <p className="text-gray-500 text-sm font-medium">Loading...</p>
  </div>
);

const DASHBOARD_PREFIXES = ['/dashboard', '/admin'];

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <MetaProvider>
          <div className="App flex flex-col min-h-screen">
            <ScrollRestoration getKey={(location) => location.pathname} />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Suspense fallback={null}>
              <UploadEncouragementModal />
            </Suspense>
            <Suspense fallback={<LoadingFallback />}>
              <LayoutRouter />
            </Suspense>
          </div>
        </MetaProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

function LayoutRouter() {
  const { pathname } = useLocation();
  const isDashboardOrAdmin = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));

  // If dashboard or admin, we just render Outlet (the internal components handle their own layout)
  if (isDashboardOrAdmin) {
    return <Outlet />;
  }

  // Otherwise, render PublicLayout wrapping the Outlet
  return (
    <div className="flex flex-col flex-1">
      <Suspense fallback={<LoadingFallback />}>
        <NetworkStatusBanner />
        <Navigation />
        <AnalyticsTracker measurementId={GOOGLE_ANALYTICS_ID} />
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </Suspense>
    </div>
  );
}
