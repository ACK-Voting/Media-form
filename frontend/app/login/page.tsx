'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserAuthProvider, useUserAuth } from '@/contexts/UserAuthContext';
import Button from '@/components/ui/Button';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useUserAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Member Login</h1>
                        <p className="text-gray-500 mt-1">ACK Media Team Portal</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600">
                                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                Remember me
                            </label>
                            <Link href="/forgot-password" className="text-purple-600 hover:text-purple-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
                        <p className="text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                                Apply to join
                            </Link>
                        </p>
                        <p className="text-xs text-gray-400">
                            <Link href="/admin" className="hover:text-gray-500">
                                Admin Login →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <UserAuthProvider>
            <LoginForm />
        </UserAuthProvider>
    );
}
