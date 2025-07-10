import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MetaProvider } from './context/MetaContext';
import Navigation from './components/Navigation';
import { Toaster } from 'react-hot-toast';
import React, { Suspense, lazy } from 'react';
import Error404 from './pages/Error404';
import Footer from './components/Footer';
import AnalyticsTracker from './components/AnalyticsTracker';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBanner from './components/NetworkStatusBanner';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Browse = lazy(() => import('./pages/Browse'));
const Upload = lazy(() => import('./pages/Upload'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminHome = lazy(() => import('./pages/admin'));
const AdminPapers = lazy(() => import('./pages/admin/papers'));
const AdminMeta = lazy(() => import('./pages/admin/meta'));
const AdminUsers = lazy(() => import('./pages/admin/users'));
const ProtectedAdminRoute = lazy(() => import('./pages/admin/ProtectedAdminRoute'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

function App() {
  // Google Analytics 4 setup
  // TODO: Replace 'G-XXXXXXXXXX' with your actual Measurement ID
  ReactGA.initialize('G-XXXXXXXXXX');
  return (
    <AuthProvider>
      <MetaProvider>
        <Router>
          <div className="App flex flex-col min-h-screen">
            <Toaster position="top-right" />
            <NetworkStatusBanner />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
            <Routes>
              {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedAdminRoute><AdminHome /></ProtectedAdminRoute>} />
                <Route path="/admin/papers" element={<ProtectedAdminRoute><AdminPapers /></ProtectedAdminRoute>} />
                <Route path="/admin/meta" element={<ProtectedAdminRoute><AdminMeta /></ProtectedAdminRoute>} />
                <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
              {/* Public Routes */}
              <Route path="/*" element={
                  <div className="flex flex-col flex-1">
                  <Navigation />
                    <AnalyticsTracker />
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="*" element={<Error404 />} />
                  </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </div>
              } />
            </Routes>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </MetaProvider>
    </AuthProvider>
  );
}

export default App;
