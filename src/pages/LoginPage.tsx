import { AdminLoginOtpModalConnected } from '@/components/auth/AdminLoginOtpModal';
import { LoginBrandingAside } from '@/components/login/LoginBrandingAside';
import { LoginCredentialsColumn } from '@/components/login/LoginCredentialsColumn';
import { dashboardForRole } from '@/constants';
import {
  useLoginEmailAuth,
  type LoginRole,
} from '@/hooks/use-login-email-auth';
import { useLoginSessionRedirect } from '@/hooks/use-login-session-redirect';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [role, setRole] = useState<LoginRole>('user');
  const navigate = useNavigate();

  useLoginSessionRedirect();
  const emailAuth = useLoginEmailAuth(role);

  return (
    <div className="flex min-h-screen">
      <AdminLoginOtpModalConnected controller={emailAuth.adminOtp} />
      <LoginBrandingAside />
      <LoginCredentialsColumn
        role={role}
        onRoleChange={setRole}
        onGoogleSuccess={() => navigate(dashboardForRole(role))}
        emailAuth={emailAuth}
      />
    </div>
  );
};

export default LoginPage;
