import {
  googleAuthLogin as googleAuthLoginApi,
  logout as logoutApi,
} from '@/api-client';
import {
  getCookie,
  removeCookie,
  resetCookies,
  setCookie,
} from '@/lib/helpers';
import type { UserRole } from '@/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  roles: UserRole[];
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const getStoredUser = (): User | null => {
  const storedUser = getCookie('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const persistUser = (user: User) => {
  setCookie('user', JSON.stringify(user));
};

const clearStoredUser = () => {
  removeCookie('user', { path: '/' });
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useCallback(async (idToken: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data } = await googleAuthLoginApi({
        idToken,
        role,
        fcmToken: '',
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
      resetCookies();
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
        setUser,
        isAuthenticated: !!user,
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
