'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userAuthAPI, notificationsAPI } from '@/lib/api';
import type { User } from '@/types';

interface UserAuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    const refreshUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const response = await notificationsAPI.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.count || 0);
            }
        } catch {
            // Silently fail
        }
    }, [token]);

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        if (storedToken) {
            setToken(storedToken);
            fetchProfile(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    // Poll for unread notifications every 30 seconds
    useEffect(() => {
        if (!token) return;
        refreshUnreadCount();
        const interval = setInterval(refreshUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [token, refreshUnreadCount]);

    const fetchProfile = async (authToken: string) => {
        try {
            // Temporarily set the token for the API call
            localStorage.setItem('userToken', authToken);
            const response = await userAuthAPI.getProfile();
            if (response.success) {
                setUser(response.user);
                setToken(authToken);
            } else {
                localStorage.removeItem('userToken');
            }
        } catch {
            localStorage.removeItem('userToken');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await userAuthAPI.login(email, password);
            if (response.success && response.token) {
                localStorage.setItem('userToken', response.token);
                setToken(response.token);
                setUser(response.user);
                router.push('/portal');
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setUser(null);
        setUnreadCount(0);
        router.push('/login');
    };

    return (
        <UserAuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isLoading,
                isAuthenticated: !!user && !!token,
                unreadCount,
                refreshUnreadCount,
            }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
}
