'use client';

import { LiveImageGenerator, WebSocketStatus } from '@/components';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import Link from 'next/link';

export default function ImagesPage() {
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-50">
                {/* En-tête */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <Link 
                                    href="/"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    ← Retour
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Images générées
                                </h1>
                            </div>
                            <WebSocketStatus showDetails={true} />
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <LiveImageGenerator 
                        className=""
                        showConnectionStatus={true}
                        maxImages={100}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}