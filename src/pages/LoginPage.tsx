import { login } from '@/api-client';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboardForRole, ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCookie, setCookie } from '@/lib/helpers';
import { getApiErrorMessage } from '@/lib/utils';
import { Eye, EyeOff, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [role, setRole] = useState<'user' | 'lawyer'>('user');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeRole = getCookie('x-active-role');
  const authUser = getCookie('auth-user');
  const { toast } = useToast();

  useEffect(() => {
    if (authUser) {
      navigate(dashboardForRole(activeRole));
    }
  }, [user, navigate, activeRole, authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await login({ email, password, role });
      if (!data.status) throw new Error(data.message);
      setCookie('access-token', data.accessToken);
      setCookie('refresh-token', data.refreshToken);
      if (data?.isAdmin) {
        setCookie('x-active-role', 'admin');
        return navigate(ROUTES.admin.dashboard);
      } else {
        setCookie('x-active-role', role as string);
      }
      toast({ title: 'Welcome back!', description: `Logged in as ${role}.` });
      navigate(dashboardForRole(role));
    } catch (e) {
      toast({
        title: 'Login failed',
        description: getApiErrorMessage(e),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    navigate(dashboardForRole(role));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden flex-col justify-between bg-navy p-10 lg:flex lg:w-2/5">
        <Link to={ROUTES.home} className="flex items-center gap-2.5">
          <Scale className="h-6 w-6 text-gold" />
          <span className="font-serif text-xl font-bold text-primary-foreground">
            NyayaSetu
          </span>
        </Link>
        <div>
          <h2 className="font-serif text-3xl font-bold leading-snug text-primary-foreground">
            Your legal rights,
            <br />
            <span className="text-gold">protected.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/60">
            Access verified legal advocates, track your cases, and resolve
            disputes — all from one platform.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} NyayaSetu
        </p>
      </div>

      {/* Login form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Scale className="h-6 w-6 text-gold" />
            <span className="font-serif text-xl font-bold">NyayaSetu</span>
          </div>

          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Select your role and enter your credentials
          </p>

          {/* Role toggle */}
          <div className="mt-6 flex rounded-lg border bg-muted p-1">
            {(['user', 'lawyer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${role === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {r === 'user' ? 'User' : 'Lawyer'}
              </button>
            ))}
          </div>

          {/* Google Sign-In */}
          <GoogleLoginButton role={role} onSuccess={handleGoogleSuccess} />

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              or sign in with email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to={ROUTES.forgotPassword}
                  className="text-xs text-gold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to={ROUTES.register}
              state={{ role }}
              className="font-medium text-gold hover:underline"
            >
              Create one
            </Link>
          </p>
          {/* <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link to={ROUTES.admin.login} className="hover:underline">
              Admin Login →
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
