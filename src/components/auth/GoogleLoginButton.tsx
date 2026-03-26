import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types";

interface GoogleLoginButtonProps {
  role: UserRole;
  onSuccess: () => void;
}

const GoogleLoginButton = ({ role, onSuccess }: GoogleLoginButtonProps) => {
  const { googleLogin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  console.log("[GoogleLoginButton] Rendered with role:", role);

  const handleCredentialResponse = async (response: CredentialResponse) => {
    console.log("[GoogleLoginButton] onSuccess fired, response:", response);
    const idToken = response.credential;
    console.log(
      "[GoogleLoginButton] idToken:",
      idToken ? `${idToken.substring(0, 20)}...` : "MISSING",
    );

    if (!idToken) {
      toast({
        title: "Google sign-in failed",
        description: "No credential received.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        "[GoogleLoginButton] Calling googleLogin API with role:",
        role,
      );
      await googleLogin(idToken, role);
      console.log("[GoogleLoginButton] API call succeeded");
      toast({
        title: "Welcome!",
        description: `Signed in with Google as ${role}.`,
      });
      onSuccess();
    } catch (err) {
      console.error("[GoogleLoginButton] API call failed:", err);
      toast({
        title: "Google sign-in failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error(
      "[GoogleLoginButton] onError fired — Google OAuth popup failed or was cancelled",
    );
    toast({
      title: "Google sign-in failed",
      description: "Google authentication was cancelled or failed.",
      variant: "destructive",
    });
  };

  return (
    <div className="mt-6 flex justify-center [&>div]:w-full">
      {isLoading ? (
        <div className="flex w-full items-center justify-center rounded-lg border bg-card px-4 py-2.5 text-sm text-muted-foreground">
          Signing in with Google...
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleCredentialResponse}
          onError={handleError}
          width="400"
          text="continue_with"
          shape="rectangular"
          size="large"
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;
