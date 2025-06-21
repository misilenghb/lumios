
'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  register: (email: string) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
        setIsAuthLoading(false);
    }
  }, []);

  const login = useCallback((email: string) => {
    const newUser = { email };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    toast({ title: t('toasts.loginSuccessTitle'), description: t('toasts.loginSuccessDesc', { email }) });
    router.push('/');
  }, [router, toast, t]);

  const register = useCallback((email: string) => {
    // In a real app, this would hit an API endpoint. Here we just log it.
    console.log(`Simulating registration for ${email}`);
    toast({ title: t('toasts.registerSuccessTitle'), description: t('toasts.registerSuccessDesc') });
    router.push('/login');
  }, [router, toast, t]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    toast({ title: t('toasts.logoutSuccessTitle') });
    router.push('/');
  }, [router, toast, t]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
