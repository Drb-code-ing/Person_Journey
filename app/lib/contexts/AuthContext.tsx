'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('aurum_user', JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem('aurum_user');
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化：从 localStorage 恢复用户，然后验证
  useEffect(() => {
    const cached = localStorage.getItem('aurum_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch { /* ignore */ }
    }
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('aurum_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || '登录失败' };
    } catch {
      return { success: false, error: '网络连接失败' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('aurum_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || '注册失败' };
    } catch {
      return { success: false, error: '网络连接失败' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem('aurum_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
