'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/contexts/UserAuthContext';

export default function UserProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useUserAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
