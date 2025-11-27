// Authenticated layout wrapper with user profile

'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
