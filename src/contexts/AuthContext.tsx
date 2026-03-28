import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserRole } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  availableRoles?: UserRole[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const mockUsers: Record<UserRole, AuthUser> = {
      user: { id: 'u1', name: 'Rajesh Kumar', email, role: 'user', availableRoles: ['user', 'admin'] },
      lawyer: { id: 'l1', name: 'Adv. Priya Sharma', email, role: 'lawyer', availableRoles: ['lawyer'] },
      admin: { id: 'a1', name: 'Platform Admin', email, role: 'admin', availableRoles: ['admin', 'user'] },
    };
    const authUser = mockUsers[role];
    setUser(authUser);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    localStorage.setItem('auth_token', 'mock_token_' + role);
    setIsLoading(false);
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setUser(prev => {
      if (!prev || !prev.availableRoles?.includes(newRole)) return prev;
      const updated = { ...prev, role: newRole };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
