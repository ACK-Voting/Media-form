'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { userAuthAPI } from '@/lib/api';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await userAuthAPI.forgotPassword(email);
        } catch {
            // Always show success to avoid email enumeration
        } finally {
            setIsLoading(false);
            setSent(true);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/Background.jpeg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/75" />

            {/* Back link */}
            <Link
                href="/login"
                className="absolute top-5 left-5 flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors z-10"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Login
            </Link>

            {/* Card */}
            <div className="relative w-full max-w-md z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400" />

                    <div className="p-8 md:p-10">
                        {sent ? (
                            /* Success state */
                            <div className="text-center py-4">
                                <div className="w-14 h-14 rounded-2xl bg-green-400/20 border border-green-400/30 flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                                <p className="text-white/60 text-sm leading-relaxed mb-8">
                                    If an account with <span className="text-white/80 font-medium">{email || 'that address'}</span> exists, we&apos;ve sent a password reset link. Check your inbox (and spam folder).
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] text-sm"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            /* Form state */
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-5 shadow-lg">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                                    <p className="text-white/60 text-sm mt-1.5 leading-relaxed">
                                        No worries — enter your email and we&apos;ll send you a reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 transition-all"
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                        />
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
                                                Sending…
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-7 pt-6 border-t border-white/10 text-center">
                                    <Link href="/login" className="text-white/50 hover:text-white/80 text-sm transition-colors">
                                        Remembered your password?{' '}
                                        <span className="text-yellow-300/90 hover:text-yellow-300 font-medium">Sign in</span>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-center text-white/35 text-xs mt-6 px-4">
                    &quot;Each of you should use whatever gift you have received to serve others.&quot; — 1 Peter 4:10
                </p>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <UserAuthProvider>
            <ForgotPasswordForm />
        </UserAuthProvider>
    );
}
