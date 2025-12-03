'use client';

import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';

export function WebSocketDiagnostic() {
    const { 
        isConnected, 
        connectionStatus, 
        lastEvent, 
        error,
        connect,
        disconnect 
    } = useWebSocket();
    
    const { session, isAuthenticated } = useAuth();

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                🔌 Diagnostic WebSocket
            </h3>

            <div className="space-y-4">
                {/* État de l'authentification */}
                <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-700 mb-2">Authentification</h4>
                    <div className="text-sm space-y-1">
                        <div>Authentifié: {isAuthenticated ? '✅ Oui' : '❌ Non'}</div>
                        <div>Token disponible: {session?.token ? '✅ Oui' : '❌ Non'}</div>
                        {session?.token && (
                            <div className="text-xs text-gray-500 break-all">
                                Token: {session.token.substring(0, 50)}...
                            </div>
                        )}
                    </div>
                </div>

                {/* État de la connexion WebSocket */}
                <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-700 mb-2">WebSocket</h4>
                    <div className="text-sm space-y-1">
                        <div>Statut: 
                            <span className={`ml-2 font-medium ${
                                connectionStatus === 'connected' ? 'text-green-600' :
                                connectionStatus === 'connecting' ? 'text-yellow-600' :
                                connectionStatus === 'error' ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                                {connectionStatus}
                            </span>
                        </div>
                        <div>Connecté: {isConnected ? '✅ Oui' : '❌ Non'}</div>
                        <div className="text-xs text-gray-500">
                            URL: wss://client.konama.fuzdi.fr/ws
                        </div>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <h4 className="font-medium text-red-700 mb-2">Erreur</h4>
                        <div className="text-sm text-red-600">
                            {error}
                        </div>
                    </div>
                )}

                {/* Dernier événement */}
                {lastEvent && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <h4 className="font-medium text-blue-700 mb-2">Dernier événement</h4>
                        <div className="text-sm text-blue-600">
                            <div><strong>Type:</strong> {lastEvent.type}</div>
                            {lastEvent.data ? (
                                <>
                                    {lastEvent.data.status && (
                                        <div><strong>Statut:</strong> {lastEvent.data.status}</div>
                                    )}
                                    {lastEvent.data.taskId && (
                                        <div><strong>Tâche:</strong> {lastEvent.data.taskId}</div>
                                    )}
                                    {lastEvent.data.files && (
                                        <div><strong>Fichiers:</strong> {lastEvent.data.files.length}</div>
                                    )}
                                </>
                            ) : (
                                <div><strong>Message:</strong> {typeof lastEvent === 'object' ? JSON.stringify(lastEvent) : String(lastEvent)}</div>
                            )}
                            <div><strong>Timestamp:</strong> {lastEvent.timestamp ? new Date(lastEvent.timestamp).toLocaleString() : 'Non disponible'}</div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                    <button
                        onClick={connect}
                        disabled={connectionStatus === 'connecting'}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
                    >
                        {connectionStatus === 'connecting' ? 'Connexion...' : 'Connecter'}
                    </button>
                    <button
                        onClick={disconnect}
                        disabled={connectionStatus === 'disconnected'}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded transition-colors"
                    >
                        Déconnecter
                    </button>
                </div>

                {/* Test de token */}
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <h4 className="font-medium text-yellow-700 mb-2">Information technique</h4>
                    <div className="text-xs text-yellow-600 space-y-1">
                        <div>• Le WebSocket utilise le token d&apos;accès en query parameter</div>
                        <div>• Format: wss://client.konama.fuzdi.fr/ws?token=TOKEN</div>
                        <div>• Reconnexion automatique en cas de déconnexion</div>
                        <div>• Maximum 5 tentatives de reconnexion</div>
                    </div>
                </div>
            </div>
        </div>
    );
}