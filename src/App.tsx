import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import PlansPage from "./pages/PlansPage";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import UserDashboard from "./pages/user/UserDashboard";
import UserCases from "./pages/user/UserCases";
import CaseDetail from "./pages/user/CaseDetail";
import NewCase from "./pages/user/NewCase";
import UserSubscription from "./pages/user/UserSubscription";
import UserNotifications from "./pages/user/UserNotifications";
import UserProfile from "./pages/user/UserProfile";
import LawyersDirectory from "./pages/user/LawyersDirectory";
import LawyerProfileView from "./pages/user/LawyerProfileView";

import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import LawyerCases from "./pages/lawyer/LawyerCases";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminLawyers from "./pages/admin/AdminLawyers";
import AdminLawyerDetail from "./pages/admin/AdminLawyerDetail";
import AdminCases from "./pages/admin/AdminCases";
import AdminCaseDetail from "./pages/admin/AdminCaseDetail";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCaseRequests from "./pages/admin/AdminCaseRequests";
import AdminSessionRequests from "./pages/admin/AdminSessionRequests";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/app/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
            <Route path="/app/cases" element={<ProtectedRoute allowedRoles={['user']}><UserCases /></ProtectedRoute>} />
            <Route path="/app/cases/:id" element={<ProtectedRoute allowedRoles={['user']}><CaseDetail /></ProtectedRoute>} />
            <Route path="/app/new-case" element={<ProtectedRoute allowedRoles={['user']}><NewCase /></ProtectedRoute>} />
            <Route path="/app/subscription" element={<ProtectedRoute allowedRoles={['user']}><UserSubscription /></ProtectedRoute>} />
            <Route path="/app/notifications" element={<ProtectedRoute allowedRoles={['user']}><UserNotifications /></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />
            <Route path="/app/lawyers" element={<ProtectedRoute allowedRoles={['user']}><LawyersDirectory /></ProtectedRoute>} />
            <Route path="/app/lawyers/:id" element={<ProtectedRoute allowedRoles={['user']}><LawyerProfileView /></ProtectedRoute>} />

            {/* Lawyer */}
            <Route path="/lawyer/dashboard" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerDashboard /></ProtectedRoute>} />
            <Route path="/lawyer/cases" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerCases /></ProtectedRoute>} />
            <Route path="/lawyer/cases/:id" element={<ProtectedRoute allowedRoles={['lawyer']}><CaseDetail /></ProtectedRoute>} />
            <Route path="/lawyer/notifications" element={<ProtectedRoute allowedRoles={['lawyer']}><UserNotifications /></ProtectedRoute>} />
            <Route path="/lawyer/profile" element={<ProtectedRoute allowedRoles={['lawyer']}><UserProfile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserDetail /></ProtectedRoute>} />
            <Route path="/admin/lawyers" element={<ProtectedRoute allowedRoles={['admin']}><AdminLawyers /></ProtectedRoute>} />
            <Route path="/admin/lawyers/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminLawyerDetail /></ProtectedRoute>} />
            <Route path="/admin/cases" element={<ProtectedRoute allowedRoles={['admin']}><AdminCases /></ProtectedRoute>} />
            <Route path="/admin/cases/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminCaseDetail /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptions /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
