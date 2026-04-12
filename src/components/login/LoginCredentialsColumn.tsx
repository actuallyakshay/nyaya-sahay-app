import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { BrandLogo } from '@/components/BrandLogo';
import { LoginEmailPasswordForm } from '@/components/login/LoginEmailPasswordForm';
import { LoginOAuthDivider } from '@/components/login/LoginOAuthDivider';
import { LoginRoleToggle } from '@/components/login/LoginRoleToggle';
import type { LoginEmailAuth, LoginRole } from '@/hooks/use-login-email-auth';

interface LoginCredentialsColumnProps {
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  onGoogleSuccess: () => void;
  emailAuth: LoginEmailAuth;
}

export function LoginCredentialsColumn({
  role,
  onRoleChange,
  onGoogleSuccess,
  emailAuth,
}: LoginCredentialsColumnProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <BrandLogo size="lg" textVariant="header" />
        </div>

        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Select your role and enter your credentials
        </p>

        <LoginRoleToggle value={role} onChange={onRoleChange} />
        <GoogleLoginButton role={role} onSuccess={onGoogleSuccess} />
        <LoginOAuthDivider />
        <LoginEmailPasswordForm auth={emailAuth} />
      </div>
    </div>
  );
}
