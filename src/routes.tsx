import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import App from './App';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthAction = lazy(() => import('./pages/AuthAction'));
const Browse = lazy(() => import('./pages/Browse'));
const Upload = lazy(() => import('./pages/Upload'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminHome = lazy(() => import('./pages/admin'));
const AdminPapers = lazy(() => import('./pages/admin/papers'));
const AdminUsers = lazy(() => import('./pages/admin/users'));
const AdminMeta = lazy(() => import('./pages/admin/meta'));
const AdminModalAnalytics = lazy(() => import('./pages/admin/modal-analytics'));
const AdminContactMessages = lazy(() => import('./pages/admin/ContactMessages'));
const ProtectedAdminRoute = lazy(() => import('./pages/admin/ProtectedAdminRoute'));
const AdminRewards = lazy(() => import('./pages/admin/rewards'));
const AdminWithdrawals = lazy(() => import('./pages/admin/withdrawals'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const FAQ = lazy(() => import('./pages/FAQ'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const DiagnosticsDashboard = lazy(() => import('./components/DiagnosticsDashboard'));
const MBBUQuestionPapers = lazy(() => import('./pages/universities/MBBUQuestionPapers'));
const BBMCQuestionPapers = lazy(() => import('./pages/universities/BBMCQuestionPapers'));
const CollegeCourseSemester = lazy(() => import('./pages/CollegeCourseSemester'));
const HTMLSitemap = lazy(() => import('./pages/HTMLSitemap'));
const Error404 = lazy(() => import('./pages/Error404'));

// ── SEO SILO — Cluster A: Universities ────────────────────────────────────────
const TripuraHub = lazy(() => import('./pages/universities/TripuraHub'));

// ── SEO SILO — Cluster C: Courses ─────────────────────────────────────────────
const CoursesHub = lazy(() => import('./pages/courses/CoursesHub'));
const BACourseHub = lazy(() => import('./pages/courses/BACourseHub'));
const BScCourseHub = lazy(() => import('./pages/courses/BScCourseHub'));
const BComCourseHub = lazy(() => import('./pages/courses/BComCourseHub'));
const BCACourseHub = lazy(() => import('./pages/courses/BCACourseHub'));

// ── SEO SILO — Cluster D: Guides ─────────────────────────────────────────────
const GuidesIndex = lazy(() => import('./pages/guides/GuidesIndex'));
const HowToUsePYQ = lazy(() => import('./pages/guides/HowToUsePYQ'));
const AreQuestionsRepeated = lazy(() => import('./pages/guides/AreQuestionsRepeated'));
const ExamPreparationStrategy = lazy(() => import('./pages/guides/ExamPreparationStrategy'));

const routes = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'reset-password', element: <ResetPassword /> },
            { path: 'auth/action', element: <AuthAction /> },
            { path: 'browse', element: <Browse /> },
            { path: 'upload', element: <Upload /> },
            { path: 'about', element: <About /> },
            { path: 'contact', element: <Contact /> },
            { path: 'privacy', element: <Privacy /> },
            { path: 'terms', element: <Terms /> },
            { path: 'cookie-policy', element: <CookiePolicy /> },
            { path: 'help-center', element: <HelpCenter /> },
            { path: 'faq', element: <FAQ /> },
            { path: 'diagnostics', element: import.meta.env?.DEV ? <DiagnosticsDashboard /> : <Error404 /> },

            // ── Cluster A: Universities ──────────────────────────────────────
            { path: 'universities/tripura', element: <TripuraHub /> },
            { path: 'universities/tripura/mbbu-question-papers', element: <MBBUQuestionPapers /> },
            { path: 'universities/tripura/bbmc-question-papers', element: <BBMCQuestionPapers /> },
            { path: 'universities/tripura/mbbu-question-papers/ma', element: <Navigate to="/browse?university=MBBU&course=MA" replace /> },
            { path: ':college/:course/:semester-question-papers', element: <CollegeCourseSemester /> },

            // ── Cluster C: Courses ───────────────────────────────────────────
            { path: 'courses', element: <CoursesHub /> },
            { path: 'courses/ba', element: <BACourseHub /> },
            { path: 'courses/bsc', element: <BScCourseHub /> },
            { path: 'courses/bcom', element: <BComCourseHub /> },
            { path: 'courses/bca', element: <BCACourseHub /> },

            // ── Cluster D: Guides ────────────────────────────────────────────
            { path: 'guides', element: <GuidesIndex /> },
            { path: 'guides/how-to-use-previous-year-papers', element: <HowToUsePYQ /> },
            { path: 'guides/are-questions-repeated-in-exams', element: <AreQuestionsRepeated /> },
            { path: 'guides/exam-preparation-strategy', element: <ExamPreparationStrategy /> },

            // ── Utility ──────────────────────────────────────────────────────
            { path: 'sitemap', element: <HTMLSitemap /> },
            { path: 'dashboard/*', element: <Dashboard /> },

            { path: 'admin', element: <ProtectedAdminRoute><AdminHome /></ProtectedAdminRoute> },
            { path: 'admin/pending', element: <ProtectedAdminRoute><AdminPapers /></ProtectedAdminRoute> },
            { path: 'admin/papers', element: <ProtectedAdminRoute><AdminPapers /></ProtectedAdminRoute> },
            { path: 'admin/meta', element: <ProtectedAdminRoute><AdminMeta /></ProtectedAdminRoute> },
            { path: 'admin/users', element: <ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute> },
            { path: 'admin/modal-analytics', element: <ProtectedAdminRoute><AdminModalAnalytics /></ProtectedAdminRoute> },
            { path: 'admin/rewards', element: <ProtectedAdminRoute><AdminRewards /></ProtectedAdminRoute> },
            { path: 'admin/withdrawals', element: <ProtectedAdminRoute><AdminWithdrawals /></ProtectedAdminRoute> },
            { path: 'admin/messages', element: <ProtectedAdminRoute><AdminContactMessages /></ProtectedAdminRoute> },

            { path: '*', element: <Error404 /> }
        ]
    }
];

export default routes;
