'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserAuthProvider, useUserAuth } from '@/contexts/UserAuthContext';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/Background.jpeg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/75" />

            {/* Back link */}
            <Link
                href="/"
                className="absolute top-5 left-5 flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors z-10"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </Link>

            {/* Card */}
            <div className="relative w-full max-w-md z-10">
                {/* Glass card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400" />

                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-5 shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                            <p className="text-white/60 text-sm mt-1">ACK Media Team Portal</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition-all"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition-all"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end text-sm">
                                <Link href="/forgot-password" className="text-yellow-300/90 hover:text-yellow-300 font-medium transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 font-semibold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-7 pt-6 border-t border-white/10 text-center">
                            <p className="text-white/50 text-sm">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="text-yellow-300/90 hover:text-yellow-300 font-medium transition-colors">
                                    Apply to join
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bible verse */}
                <p className="text-center text-white/35 text-xs mt-6 px-4">
                    &quot;Each of you should use whatever gift you have received to serve others.&quot; — 1 Peter 4:10
                </p>
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
