// User profile and logout component

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function UserProfile() {
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, logout, isLoading } = useAuth();

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            // Still proceed with logout even if API call fails
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email.split('@')[0];
    const initials = getInitials(displayName);

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-2"
            >
                <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {initials}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <svg
                    className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                            <p className="font-medium">{displayName}</p>
                            <p className="text-gray-500">{user.email}</p>
                            {user.role && (
                                <p className="text-xs text-indigo-600 mt-1">
                                    {user.role}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => setShowDropdown(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Profile Settings
                        </button>

                        <hr className="my-1" />

                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                    Signing out...
                                </span>
                            ) : (
                                'Sign out'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
}
