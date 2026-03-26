import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserRole } from "@/types";
import {
  googleAuthLogin as googleAuthLoginApi,
  logout as logoutApi,
} from "@/api-client";

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
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  googleLogin: (idToken: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AUTH_USER_KEY = "auth_user";

const getStoredUser = (): AuthUser | null => {
  const stored = localStorage.getItem(AUTH_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

const persistUser = (user: AuthUser) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const clearStoredUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, _password: string, role: UserRole) => {
      setIsLoading(true);
      // Mock login — will be replaced with real API call
      await new Promise((r) => setTimeout(r, 800));
      const mockUsers: Record<UserRole, AuthUser> = {
        user: { id: "u1", name: "Rajesh Kumar", email, role: "user" },
        lawyer: { id: "l1", name: "Adv. Priya Sharma", email, role: "lawyer" },
        admin: { id: "a1", name: "Platform Admin", email, role: "admin" },
      };
      const authUser = mockUsers[role];
      setUser(authUser);
      persistUser(authUser);
      setIsLoading(false);
    },
    [],
  );

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
        login,
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
