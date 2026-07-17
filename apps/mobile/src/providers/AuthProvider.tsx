import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiLogin, apiRegister, setAuthToken, UserRole } from '@emour/core';
import { getToken, saveToken, removeToken, getRole, saveRole, removeRole } from '@/services/tokens';

interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  isViewer: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getToken(), getRole()]).then(([storedToken, storedRole]) => {
      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);
        setRole((storedRole as UserRole) ?? 'owner');
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, role: r } = await apiLogin(email, password);
    await saveToken(t);
    await saveRole(r);
    setAuthToken(t);
    setToken(t);
    setRole(r);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { token: t, role: r } = await apiRegister(email, password);
    await saveToken(t);
    await saveRole(r);
    setAuthToken(t);
    setToken(t);
    setRole(r);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    await removeRole();
    setAuthToken(null);
    setToken(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, isViewer: role === 'viewer', isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
