import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import { getCookie } from "@/lib/cookies";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isAuthenticated } = useAuth();
  const activeRole = getCookie("x-active-role");



  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(activeRole)) {
    const redirectMap: Record<UserRole, string> = {
      user: "/app/dashboard",
      lawyer: "/lawyer/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }






  return <>{children}</>;
};

export default ProtectedRoute;
