import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (token && raw) {
      return { token, user: JSON.parse(raw), isAuthenticated: true };
    }
  } catch {
    // ignore
  }
  return { token: null, user: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredAuth);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ token, user, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ token: null, user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}