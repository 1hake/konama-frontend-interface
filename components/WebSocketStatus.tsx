'use client';

import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketStatusProps {
    className?: string;
    showDetails?: boolean;
}

export function WebSocketStatus({ className = '', showDetails = false }: WebSocketStatusProps) {
    const { 
        connectionStatus, 
        generatedImages, 
        lastEvent,
        error,
        connect
    } = useWebSocket();

    // Détermine l'apparence basée sur le statut
    const getStatusStyle = () => {
        switch (connectionStatus) {
            case 'connected':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-200',
                    emoji: '🟢',
                    label: 'Connecté'
                };
            case 'connecting':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    border: 'border-yellow-200',
                    emoji: '🟡',
                    label: 'Connexion...'
                };
            case 'disconnected':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    border: 'border-gray-200',
                    emoji: '🔴',
                    label: 'Déconnecté'
                };
            case 'error':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    border: 'border-red-200',
                    emoji: '⚠️',
                    label: 'Erreur'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-600',
                    border: 'border-gray-200',
                    emoji: '⚫',
                    label: 'Inconnu'
                };
        }
    };

    const style = getStatusStyle();

    return (
        <div className={`${style.bg} ${style.text} ${style.border} border rounded-lg p-3 ${className}`}>
            <div className="flex items-center space-x-2">
                <span className="text-sm">{style.emoji}</span>
                <span className="text-sm font-medium">WebSocket: {style.label}</span>
                {generatedImages.length > 0 && (
                    <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
                        {generatedImages.length} image{generatedImages.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {showDetails && (
                <div className="mt-2 space-y-1">
                    {error && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            Erreur: {error}
                        </div>
                    )}

                    {lastEvent && (
                        <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                            <div>
                                <strong>Dernier événement:</strong> {lastEvent.type}
                            </div>
                            {lastEvent.data ? (
                                <div>
                                    {lastEvent.data.status && `Statut: ${lastEvent.data.status}`}
                                    {lastEvent.data.status && lastEvent.data.taskId && ' | '}
                                    {lastEvent.data.taskId && `Tâche: ${lastEvent.data.taskId.substring(0, 8)}...`}
                                </div>
                            ) : lastEvent.message && (
                                <div>Message: {lastEvent.message}</div>
                            )}
                            <div className="text-gray-600 mt-1">
                                {lastEvent.timestamp ? new Date(lastEvent.timestamp).toLocaleString() : 'Maintenant'}
                            </div>
                        </div>
                    )}

                    {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                        <button
                            onClick={connect}
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                        >
                            Reconnecter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}