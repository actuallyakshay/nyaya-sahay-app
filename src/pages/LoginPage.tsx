import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Scale, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/api-client";
import { setCookie } from "@/lib/cookies";
import type { UserRole } from "@/types";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import {
  validateLoginForm,
  hasFormErrors,
  getApiErrorMessage,
  type LoginErrors,
} from "@/lib/utils";

const LoginPage = () => {
  const [role, setRole] = useState<"user" | "lawyer">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Record<string, string>) => login(payload),
    onSuccess: (response: {
      data: {
        user: {
          id: string;
          fullName: string;
          email: string;
          validRoles: string[];
          avatar?: string;
        };
        accessToken: string;
        refreshToken: string;
      };
    }) => {
      const { user: apiUser, accessToken, refreshToken } = response.data;
      setAuthUser({
        id: apiUser.id,
        name: apiUser.fullName,
        email: apiUser.email,
        validRoles: apiUser.validRoles,
        avatar: apiUser.avatar,
      });
      setCookie("access_token", accessToken);
      setCookie("refresh_token", refreshToken);
      setCookie("x-active-role", role);
      toast({ title: "Welcome back!", description: `Logged in as ${role}.` });
      navigate(role === "lawyer" ? "/lawyer/dashboard" : "/app/dashboard");
    },
    onError: (err: unknown) => {
      toast({
        title: "Login failed",
        description: getApiErrorMessage(err, "Please check your credentials."),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateLoginForm({ email, password });
    setErrors(formErrors);
    if (hasFormErrors(formErrors)) return;

    const payload = {
      email: email.trim(),
      password,
      role,
    };
    mutate(payload);
  };

  const clearFieldError = (field: keyof LoginErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleGoogleSuccess = () => {
    navigate(role === "lawyer" ? "/lawyer/dashboard" : "/app/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-navy flex-col justify-between p-10">
        <Link to="/" className="flex items-center gap-2.5">
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
          <p className="mt-4 text-sm text-primary-foreground/60 max-w-sm">
            Access verified legal advocates, track your cases, and resolve
            disputes — all from one platform.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} NyayaSetu
        </p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-gold" />
            <span className="font-serif text-xl font-bold">NyayaSetu</span>
          </div>

          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Select your role and enter your credentials
          </p>

          {/* Role toggle */}
          <div className="mt-6 flex rounded-lg border bg-muted p-1">
            {(["user", "lawyer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${role === r ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "user" ? "User" : "Lawyer"}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                required
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
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
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              state={{ role }}
              className="font-medium text-gold hover:underline"
            >
              Create one
            </Link>
          </p> */}
          {/* <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link to="/admin/login" className="hover:underline">
              Admin Login →
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
