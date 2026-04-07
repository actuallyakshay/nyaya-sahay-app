import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { env } from '@/config/env';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/query-client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import HowItWorksPage from './pages/HowItWorksPage';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import PlansPage from './pages/PlansPage';
import RegisterPage from './pages/RegisterPage';

import CaseDetail from './pages/user/CaseDetail';
import LawyerProfileView from './pages/user/LawyerProfileView';
import LawyersDirectory from './pages/user/LawyersDirectory';
import NewCase from './pages/user/NewCase';
import UserCases from './pages/user/UserCases';
import UserDashboard from './pages/user/UserDashboard';
import UserNotifications from './pages/user/UserNotifications';
import UserProfile from './pages/user/UserProfile';
import UserSubscription from './pages/user/UserSubscription';

import LawyerCases from './pages/lawyer/LawyerCases';
import LawyerDashboard from './pages/lawyer/LawyerDashboard';

import AdminCaseDetail from './pages/admin/AdminCaseDetail';
import AdminCases from './pages/admin/AdminCases';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLawyerDetail from './pages/admin/AdminLawyerDetail';
import AdminLawyers from './pages/admin/AdminLawyers';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUsers from './pages/admin/AdminUsers';

import NotFound from './pages/NotFound';
import AdminCaseRequests from './pages/admin/AdminCaseRequests';
import AdminLawyerVerifications from './pages/admin/AdminLawyerVerifications';
import AdminSessionRequests from './pages/admin/AdminSessionRequests';

const App = () => (
  <GoogleOAuthProvider clientId={env.googleClientId}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* User */}
              <Route
                path="/app/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/cases"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/cases/:id"
                element={
                  // <ProtectedRoute allowedRoles={['user']}>
                  <CaseDetail />
                  // </ProtectedRoute>
                }
              />
              <Route
                path="/app/new-case"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <NewCase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/subscription"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserSubscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/notifications"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/profile"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/lawyers"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <LawyersDirectory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/lawyers/:id"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <LawyerProfileView />
                  </ProtectedRoute>
                }
              />

              {/* Lawyer */}
              <Route
                path="/lawyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['lawyer']}>
                    <LawyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer/cases"
                element={
                  <ProtectedRoute allowedRoles={['lawyer']}>
                    <LawyerCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={['lawyer']}>
                    <CaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer/notifications"
                element={
                  <ProtectedRoute allowedRoles={['lawyer']}>
                    <UserNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer/profile"
                element={
                  <ProtectedRoute allowedRoles={['lawyer']}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin/case-requests"
                element={
                  <AdminProtectedRoute>
                    <AdminCaseRequests />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin/session-requests"
                element={
                  <AdminProtectedRoute>
                    <AdminSessionRequests />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <AdminUsers />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <AdminProtectedRoute>
                    <AdminUserDetail />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/lawyers"
                element={
                  <AdminProtectedRoute>
                    <AdminLawyers />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/lawyers/:id"
                element={
                  <AdminProtectedRoute>
                    <AdminLawyerDetail />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/cases"
                element={
                  <AdminProtectedRoute>
                    <AdminCases />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin/lawyer-verifications"
                element={
                  <AdminProtectedRoute>
                    <AdminLawyerVerifications />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/cases/:id"
                element={
                  <AdminProtectedRoute>
                    <AdminCaseDetail />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/subscriptions"
                element={
                  <AdminProtectedRoute>
                    <AdminSubscriptions />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <AdminProtectedRoute>
                    <AdminPayments />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <AdminProtectedRoute>
                    <AdminSettings />
                  </AdminProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
