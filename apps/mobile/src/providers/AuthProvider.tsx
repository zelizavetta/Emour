import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiLogin, apiRegister, setAuthToken } from '@emour/core';
import { getToken, saveToken, removeToken } from '@/services/tokens';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken().then(stored => {
      if (stored) {
        setAuthToken(stored);
        setToken(stored);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t } = await apiLogin(email, password);
    await saveToken(t);
    setAuthToken(t);
    setToken(t);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { token: t } = await apiRegister(email, password);
    await saveToken(t);
    setAuthToken(t);
    setToken(t);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setAuthToken(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
