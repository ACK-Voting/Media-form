'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { userAuthAPI } from '@/lib/api';
import Button from '@/components/ui/Button';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        try {
            const res = await userAuthAPI.forgotPassword(email);
            if (res.success) {
                setMessage({
                    type: 'success',
                    text: 'If an account with that email exists, a password reset link has been sent.',
                });
                setEmail('');
            }
        } catch {
            setMessage({
                type: 'success',
                text: 'If an account with that email exists, a password reset link has been sent.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter your email address and we&apos;ll send you a reset link.
                    </p>
                </div>

                {message.text && (
                    <div className={`px-4 py-3 rounded-xl text-sm mb-6 ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                        Send Reset Link
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        ← Back to Login
                    </Link>
                </div>
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
