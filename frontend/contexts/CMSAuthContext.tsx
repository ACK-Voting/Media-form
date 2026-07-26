'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CMSUser, CMSUserRole } from '@/app/mockup/_data/mockData';

interface CMSAuthState {
  user: CMSUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface CMSAuthContextValue extends CMSAuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const CMSAuthContext = createContext<CMSAuthContextValue | null>(null);

const STORAGE_KEY = 'cms_current_user';

export function CMSAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CMSAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user: CMSUser = JSON.parse(stored);
        setState({ user, isLoading: false, isAuthenticated: true });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/cms-users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.message || 'Invalid username or password.' };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      localStorage.setItem('cms_token', data.token);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });

      const found = data.user;
      if (found.role === 'ministry_admin' && found.ministryAccess.length === 1) {
        router.push(`/cms/ministries/${found.ministryAccess[0]}`);
      } else if (found.role === 'ministry_admin') {
        router.push('/cms/ministries');
      } else {
        router.push('/cms');
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Unable to reach the server. Please try again.' };
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/cms/login');
  }, [router]);

  return (
    <CMSAuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </CMSAuthContext.Provider>
  );
}

export function useCMSAuth() {
  const ctx = useContext(CMSAuthContext);
  if (!ctx) throw new Error('useCMSAuth must be used within CMSAuthProvider');
  return ctx;
}

// Role guard component used in CMS pages
export function CMSProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: CMSUserRole[];
}) {
  const { user, isLoading, isAuthenticated } = useCMSAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/cms/login');
        return;
      }
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/cms');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
