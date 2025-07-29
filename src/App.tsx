import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MetaProvider } from './context/MetaContext';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense, useEffect } from 'react';
import { initRecaptcha, loadGoogleMaps } from './services/google';

// Lazy load components for better performance
const Navigation = lazy(() => import('./components/Navigation'));
const AnalyticsTracker = lazy(() => import('./components/AnalyticsTracker'));
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));
const NetworkStatusBanner = lazy(() => import('./components/NetworkStatusBanner'));
const Footer = lazy(() => import('./components/Footer'));
const Error404 = lazy(() => import('./pages/Error404'));

// Lazy load pages with route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Browse = lazy(() => import('./pages/Browse'));
const Upload = lazy(() => import('./pages/Upload'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminHome = lazy(() => import('./pages/admin'));
const AdminPapers = lazy(() => import('./pages/admin/papers'));
const AdminMeta = lazy(() => import('./pages/admin/meta'));
const AdminUsers = lazy(() => import('./pages/admin/users'));
const AdminSEO = lazy(() => import('./pages/admin/seo'));
const ProtectedAdminRoute = lazy(() => import('./pages/admin/ProtectedAdminRoute'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const FAQ = lazy(() => import('./pages/FAQ'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const DiagnosticsDashboard = lazy(() => import('./components/DiagnosticsDashboard'));

// Google service configuration
const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const GOOGLE_RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY || '';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  // Initialize Google services with error handling
  useEffect(() => {
    try {
    // Load Google Maps if API key is provided - defer loading for better initial performance
      if (GOOGLE_MAPS_API_KEY && typeof GOOGLE_MAPS_API_KEY === 'string' && GOOGLE_MAPS_API_KEY.length > 0) {
      const timer = setTimeout(() => {
        loadGoogleMaps(GOOGLE_MAPS_API_KEY)
            .catch(error => {
              console.warn('Failed to load Google Maps:', error);
              // Don't throw error, just log it
            });
      }, 3000); // Delay loading by 3 seconds
      
      return () => clearTimeout(timer);
    }

    // Initialize reCAPTCHA if site key is provided - defer loading
      if (GOOGLE_RECAPTCHA_SITE_KEY && typeof GOOGLE_RECAPTCHA_SITE_KEY === 'string' && GOOGLE_RECAPTCHA_SITE_KEY.length > 0) {
      const timer = setTimeout(() => {
        initRecaptcha(GOOGLE_RECAPTCHA_SITE_KEY)
            .catch(error => {
              console.warn('Failed to initialize reCAPTCHA:', error);
              // Don't throw error, just log it
            });
      }, 2000); // Delay loading by 2 seconds
      
      return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('Error in Google services initialization:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <MetaProvider>
        <Router>
          <div className="App flex flex-col min-h-screen">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<Suspense fallback={<LoadingSpinner />}><ProtectedAdminRoute><AdminHome /></ProtectedAdminRoute></Suspense>} />
                <Route path="/admin/papers" element={<Suspense fallback={<LoadingSpinner />}><ProtectedAdminRoute><AdminPapers /></ProtectedAdminRoute></Suspense>} />
                <Route path="/admin/meta" element={<Suspense fallback={<LoadingSpinner />}><ProtectedAdminRoute><AdminMeta /></ProtectedAdminRoute></Suspense>} />
                <Route path="/admin/users" element={<Suspense fallback={<LoadingSpinner />}><ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute></Suspense>} />
                <Route path="/admin/seo" element={<Suspense fallback={<LoadingSpinner />}><ProtectedAdminRoute><AdminSEO /></ProtectedAdminRoute></Suspense>} />
                {/* Public Routes */}
                <Route path="/*" element={
                  <div className="flex flex-col flex-1">
                    <Suspense fallback={<LoadingSpinner />}>
                      <NetworkStatusBanner />
                      <Navigation />
                      <AnalyticsTracker measurementId={GOOGLE_ANALYTICS_ID} />
                      <ErrorBoundary>
                        <Routes>
                          <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Home /></Suspense>} />
                          <Route path="/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
                          <Route path="/register" element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
                          <Route path="/reset-password" element={<Suspense fallback={<LoadingSpinner />}><ResetPassword /></Suspense>} />
                          <Route path="/browse" element={<Suspense fallback={<LoadingSpinner />}><Browse /></Suspense>} />
                          <Route path="/upload" element={<Suspense fallback={<LoadingSpinner />}><Upload /></Suspense>} />
                          <Route path="/dashboard/*" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                          <Route path="/about" element={<Suspense fallback={<LoadingSpinner />}><About /></Suspense>} />
                          <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><Contact /></Suspense>} />
                          <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><Privacy /></Suspense>} />
                          <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><Terms /></Suspense>} />
                          <Route path="/cookie-policy" element={<Suspense fallback={<LoadingSpinner />}><CookiePolicy /></Suspense>} />
                          <Route path="/help-center" element={<Suspense fallback={<LoadingSpinner />}><HelpCenter /></Suspense>} />
                          <Route path="/faq" element={<Suspense fallback={<LoadingSpinner />}><FAQ /></Suspense>} />
                          
                          {/* Debug/Development Routes */}
                          {import.meta.env.DEV && (
                            <Route path="/diagnostics" element={<Suspense fallback={<LoadingSpinner />}><DiagnosticsDashboard /></Suspense>} />
                          )}
                          
                          <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><Error404 /></Suspense>} />
                        </Routes>
                      </ErrorBoundary>
                    </Suspense>
                  </div>
                } />
              </Routes>
            </Suspense>
            <Suspense fallback={<div className="h-16"></div>}>
              <Footer />
            </Suspense>
          </div>
        </Router>
      </MetaProvider>
    </AuthProvider>
  );
}

export default App;
