// Authenticated layout wrapper with user profile

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    const { logout, user } = useAuth();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Navigation items
    const navItems = [
        { href: '/', label: 'Studio', icon: '🎨' },
        { href: '/images', label: 'Images', icon: '🖼️' },
        { href: '/workflow-api-example', label: 'API', icon: '⚡' },
        { href: '/diagnostic', label: 'Diagnostic', icon: '🔍' },
    ];

    return (
        <ProtectedRoute>
            {/* Header with Logo and Logout */}
            <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                            </Link>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        pathname === item.href
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>

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
