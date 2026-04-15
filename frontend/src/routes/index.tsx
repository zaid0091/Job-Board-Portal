import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRoute from '@/components/auth/RoleRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const JobListPage = lazy(() => import('@/pages/JobListPage'));
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const EmployerDashboardPage = lazy(() => import('@/pages/EmployerDashboardPage'));
const EmployerApplicationsPage = lazy(() => import('@/pages/EmployerApplicationsPage'));
const SeekerDashboardPage = lazy(() => import('@/pages/SeekerDashboardPage'));
const CreateJobPage = lazy(() => import('@/pages/CreateJobPage'));
const MyApplicationsPage = lazy(() => import('@/pages/MyApplicationsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const RequestResetPasswordPage = lazy(() => import('@/pages/RequestResetPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<SuspenseWrapper><HomePage /></SuspenseWrapper>} />
        <Route path="/jobs" element={<SuspenseWrapper><JobListPage /></SuspenseWrapper>} />
        <Route path="/jobs/:slug" element={<SuspenseWrapper><JobDetailPage /></SuspenseWrapper>} />
        <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
        <Route path="/register" element={<SuspenseWrapper><RegisterPage /></SuspenseWrapper>} />
        <Route path="/password/reset/request" element={<SuspenseWrapper><RequestResetPasswordPage /></SuspenseWrapper>} />
        <Route path="/password/reset/confirm" element={<SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>} />
        <Route path="/about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
        <Route path="/contact" element={<SuspenseWrapper><ContactPage /></SuspenseWrapper>} />
        <Route path="/privacy" element={<SuspenseWrapper><PrivacyPage /></SuspenseWrapper>} />
        <Route path="/terms" element={<SuspenseWrapper><TermsPage /></SuspenseWrapper>} />

        {/* Authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notifications" element={<SuspenseWrapper><NotificationsPage /></SuspenseWrapper>} />
        </Route>

        {/* Employer routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['EMPLOYER']} />}>
            <Route path="/employer/dashboard" element={<SuspenseWrapper><EmployerDashboardPage /></SuspenseWrapper>} />
            <Route path="/employer/applications" element={<SuspenseWrapper><EmployerApplicationsPage /></SuspenseWrapper>} />
            <Route path="/employer/profile" element={<SuspenseWrapper><ProfilePage /></SuspenseWrapper>} />
            <Route path="/employer/jobs/create" element={<SuspenseWrapper><CreateJobPage /></SuspenseWrapper>} />
          </Route>
        </Route>

        {/* Seeker routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['SEEKER']} />}>
            <Route path="/seeker/dashboard" element={<SuspenseWrapper><SeekerDashboardPage /></SuspenseWrapper>} />
            <Route path="/seeker/applications" element={<SuspenseWrapper><MyApplicationsPage /></SuspenseWrapper>} />
            <Route path="/seeker/profile" element={<SuspenseWrapper><ProfilePage /></SuspenseWrapper>} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<SuspenseWrapper><NotFoundPage /></SuspenseWrapper>} />
      </Route>
    </Routes>
  );
}
