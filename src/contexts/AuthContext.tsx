import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserRole } from "@/types";
import {
  googleAuthLogin as googleAuthLoginApi,
  logout as logoutApi,
} from "@/api-client";
import { setCookie, getCookie, removeCookie } from "@/lib/cookies";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuthUser: (user: AuthUser) => void;
  googleLogin: (idToken: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AUTH_USER_KEY = "auth_user";

const getStoredUser = (): AuthUser | null => {
  const stored = getCookie(AUTH_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

const persistUser = (user: AuthUser) => {
  setCookie(AUTH_USER_KEY, JSON.stringify(user));
};

const clearStoredUser = () => {
  removeCookie(AUTH_USER_KEY);
  removeCookie("access_token");
  removeCookie("refresh_token");
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const setAuthUser = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    persistUser(authUser);
  }, []);

  const googleLogin = useCallback(async (idToken: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data } = await googleAuthLoginApi({
        idToken,
        role,
        fcmToken: "",
      });
      setUser(data.user);
      persistUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Proceed with local cleanup even if API call fails
    }
    setUser(null);
    clearStoredUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setAuthUser,
        googleLogin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
