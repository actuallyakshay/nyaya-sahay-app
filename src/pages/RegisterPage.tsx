import { ROUTES } from '@/constants';
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Scale, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/api-client";
import {
  validateRegistrationForm,
  hasFormErrors,
  getApiErrorMessage,
  type FormErrors,
} from "@/lib/utils";

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = (location.state as { role?: string })?.role || "user";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: Record<string, string>) => {
      console.log('[Register] mutationFn executing, payload:', payload);
      return register(payload);
    },
    onSuccess: (data) => {
      console.log('[Register] API success:', data);
      toast({
        title: "Account created!",
        description: "Please log in to continue.",
      });
      // navigate("/login");
    },
    onError: (err: unknown) => {
      console.error('[Register] API error:', err);
      toast({
        title: "Registration failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Register] Form submitted');

    const formErrors = validateRegistrationForm({
      name,
      email,
      phone,
      password,
    });
    console.log('[Register] Validation errors:', formErrors);
    setErrors(formErrors);
    if (hasFormErrors(formErrors)) {
      console.log('[Register] Validation failed, aborting');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role,
    };
    console.log('[Register] Calling mutate with payload:', payload);
    mutate(payload);
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to={ROUTES.home} className="mb-8 flex items-center gap-2.5">
          <Scale className="h-6 w-6 text-gold" />
          <span className="font-serif text-xl font-bold">NyayaSetu</span>
        </Link>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start your legal support journey today
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              required
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

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
            <Label htmlFor="phone">Phone</Label>
            <div className="flex rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="phone"
                className="rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  clearFieldError("phone");
                }}
                required
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="Min 8 characters"
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
              <p className="text-xs text-destructive">
                {errors.password.join(", ")}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to={ROUTES.login} className="font-medium text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
