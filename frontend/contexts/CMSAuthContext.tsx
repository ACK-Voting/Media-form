'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CMSUser, CMSUserRole } from '@/app/_data/contentTypes';
import { apiUrl, cmsAuthHeaders, clearCMSSession, CMS_TOKEN_KEY, CMS_USER_KEY } from '@/lib/apiBase';

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

const STORAGE_KEY = CMS_USER_KEY;

export function CMSAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CMSAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  // Restore the session from localStorage for an instant first paint, then
  // confirm it against the server. Without the second step a deactivated or
  // demoted user would see a fully populated CMS whose every write then 401s.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      let cached: CMSUser | null = null;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) cached = JSON.parse(stored);
      } catch {
        cached = null;
      }

      if (!cached) {
        if (!cancelled) setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      try {
        const res = await fetch(apiUrl('/cms-users/me'), { headers: cmsAuthHeaders() });
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.success) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
          setState({ user: data.user, isLoading: false, isAuthenticated: true });
        } else {
          clearCMSSession();
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } catch {
        // Network failure, not an auth failure — keep the cached session rather
        // than logging someone out because the backend was briefly unreachable.
        if (!cancelled) setState({ user: cached, isLoading: false, isAuthenticated: true });
      }
    }

    restore();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(apiUrl('/cms-users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.message || 'Invalid username or password.' };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      localStorage.setItem(CMS_TOKEN_KEY, data.token);
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
    clearCMSSession();
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
