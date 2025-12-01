// Authenticated layout wrapper with user profile

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <ProtectedRoute>
            {/* Header with Logo and Logout */}
            <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/fuzdi_white.png"
                                alt="Fuzdi Logo"
                                width={80}
                                height={40}
                                className="h-10"
                            />
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                STUDIO
                            </h1>
                        </div>

                        {/* User Info and Logout */}
                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="text-sm text-gray-300">
                                    {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}` 
                                        : user.email.split('@')[0]
                                    }
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-600/30 hover:border-red-500/50 rounded-lg transition-all duration-200"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {children}
        </ProtectedRoute>
    );
}
