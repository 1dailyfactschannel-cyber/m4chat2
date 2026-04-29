import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

type User = {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  twoFAEnabled?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, twoFACode?: string) => Promise<void>;
  register: (username: string, password: string, email?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {
      api.setToken(null);
      api.setRefreshToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string, twoFACode?: string) => {
    const data = await api.login(username, password, twoFACode);
    setUser(data.user);
  };

  const register = async (username: string, password: string, email?: string, phone?: string) => {
    const data = await api.register(username, password, email, phone);
    setUser(data.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const logoutAll = async () => {
    await api.logoutAll();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutAll }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
