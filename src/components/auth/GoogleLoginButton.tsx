import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { setCookie } from '@/lib/helpers';
import type { UserRole } from '@/types';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GoogleLoginButtonProps {
  role: UserRole;
  onSuccess: () => void;
}

const GoogleLoginButton = ({ role, onSuccess }: GoogleLoginButtonProps) => {
  const { googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = async (response: CredentialResponse) => {
    const idToken = response.credential;

    if (!idToken) {
      toast({
        title: 'Google sign-in failed',
        description: 'No credential received.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await googleLogin(idToken, role);
      if (!data.status) throw new Error(data.message);
      setCookie('access-token', data.accessToken);
      setCookie('refresh-token', data.refreshToken);
      if (data?.isAdmin) {
        setCookie('x-active-role', 'admin');
        return navigate(ROUTES.admin.dashboard);
      } else {
        setCookie('x-active-role', role as string);
      }
      toast({
        title: 'Welcome!',
        description: `Signed in with Google as ${role}.`,
      });
      onSuccess();
    } catch (e) {
      toast({
        title: 'Login failed',
        description:
          e instanceof Error ? e.message : 'Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    toast({
      title: 'Google sign-in failed',
      description: 'Google authentication was cancelled or failed.',
      variant: 'destructive',
    });
  };

  return (
    <div className="mt-6 w-full rounded-lg">
      <div ref={wrapRef} className="min-h-[42px] w-full">
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-full border-border bg-card font-medium text-muted-foreground shadow-sm"
            disabled
          >
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Signing in with Google…
          </Button>
        ) : (
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={handleError}
            width={'100%'}
            type="standard"
            theme="outline"
            size="large"
            shape="pill"
            text="signin_with"
            logo_alignment="left"
            containerProps={{
              className:
                'flex w-full min-h-10 [&>div]:!w-full [&_iframe]:!w-full',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GoogleLoginButton;
