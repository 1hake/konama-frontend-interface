'use client';

import { WebSocketDiagnostic, WebSocketTester } from '@/components';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import Link from 'next/link';

export default function DiagnosticPage() {
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
                                    Diagnostic WebSocket
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2">
                                🔍 Comment tester la connexion WebSocket
                            </h2>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>• Cette page permet de diagnostiquer la connexion WebSocket</p>
                                <p>• Vérifiez que votre token d&apos;authentification est valide</p>
                                <p>• Surveillez les événements en temps réel</p>
                                <p>• Utilisez les boutons pour forcer la connexion/déconnexion</p>
                            </div>
                        </div>

                        <WebSocketDiagnostic />

                        <WebSocketTester />

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                📋 Format des événements attendus
                            </h3>
                            <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`{
    "type": "task.files.uploaded",
    "data": {
        "taskId": "f06c035e-473a-41d3-9f3d-854520185f13",
        "status": "SUCCESS",
        "promptId": "39f53a48-42d3-48f8-8f8f-205e360afa77",
        "comfyClientId": "1ad62b7f-3b42-4601-9be6-eb9dfbd122fd",
        "files": [
            {
                "id": "aa6411df-ff89-4bb3-8e45-5e0bf0ad411e",
                "taskId": "2a6a203b-26e6-4586-9f25-810e5d62ed47",
                "nodeId": "9",
                "fileType": "images",
                "filename": "ComfyUI00001.png",
                "s3Key": "...",
                "s3Url": "https://s3.fr-par.scw.cloud/konama-storage/...",
                "createdAt": "2025-12-03T15:07:33.855Z",
                "updatedAt": "2025-12-03T15:07:33.855Z"
            }
        ]
    },
    "timestamp": "2025-12-03T15:07:33.870Z"
}`}
                            </pre>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                ⚡ Actions automatiques
                            </h3>
                            <div className="text-sm text-yellow-700 space-y-1">
                                <p>• <strong>Connexion automatique:</strong> Se connecte dès que vous êtes authentifié</p>
                                <p>• <strong>Traitement des événements:</strong> Filtre automatiquement les tâches SUCCESS avec fichiers</p>
                                <p>• <strong>Récupération d&apos;image:</strong> Appel automatique à GET /tasks/{`{taskId}`}</p>
                                <p>• <strong>Affichage:</strong> Ajout automatique à la galerie d&apos;images</p>
                                <p>• <strong>Reconnexion:</strong> Jusqu&apos;à 5 tentatives en cas de déconnexion</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}