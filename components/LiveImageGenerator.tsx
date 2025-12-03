'use client';

import React, { useState } from 'react';
import { useWebSocket, GeneratedImage } from '@/hooks/useWebSocket';
import { SiriOrb } from './SiriOrb';
import Image from 'next/image';

interface LiveImageGeneratorProps {
    className?: string;
    showConnectionStatus?: boolean;
    maxImages?: number;
}

export function LiveImageGenerator({ 
    className = '',
    showConnectionStatus = true,
    maxImages = 20 
}: LiveImageGeneratorProps) {
    const { 
        isConnected, 
        connectionStatus, 
        generatedImages, 
        lastEvent, 
        error,
        clearImages,
        connect,
        disconnect
    } = useWebSocket();

    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

    // Limitez le nombre d'images affichées
    const displayedImages = generatedImages.slice(0, maxImages);

    // Statut de connexion avec emoji
    const getConnectionStatusDisplay = () => {
        switch (connectionStatus) {
            case 'connected':
                return { emoji: '🟢', text: 'Connecté', color: 'text-green-600' };
            case 'connecting':
                return { emoji: '🟡', text: 'Connexion...', color: 'text-yellow-600' };
            case 'disconnected':
                return { emoji: '🔴', text: 'Déconnecté', color: 'text-red-600' };
            case 'error':
                return { emoji: '⚠️', text: 'Erreur', color: 'text-red-600' };
            default:
                return { emoji: '⚫', text: 'Inconnu', color: 'text-gray-600' };
        }
    };

    const statusDisplay = getConnectionStatusDisplay();

    return (
        <div className={`space-y-6 ${className} p-8`}>
            {/* En-tête avec statut de connexion */}
            {showConnectionStatus && (
                <div className="bg-white rounded-lg  p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Images générées en temps réel
                            </h2>
                            <div className={`flex items-center space-x-2 ${statusDisplay.color}`}>
                                <span className="text-sm">{statusDisplay.emoji}</span>
                                <span className="text-sm font-medium">{statusDisplay.text}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {error && (
                                <div className="text-sm text-red-600 mr-4">
                                    {error}
                                </div>
                            )}
                            
                            {generatedImages.length > 0 && (
                                <button
                                    onClick={clearImages}
                                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                                >
                                    Vider ({generatedImages.length})
                                </button>
                            )}

                            {connectionStatus === 'disconnected' || connectionStatus === 'error' ? (
                                <button
                                    onClick={connect}
                                    className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                >
                                    Reconnecter
                                </button>
                            ) : (
                                <button
                                    onClick={disconnect}
                                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                                >
                                    Déconnecter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Dernier événement */}
                    {lastEvent && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="text-xs text-gray-600">
                                <strong>Dernier événement:</strong> {lastEvent.type}
                                {lastEvent.data && (
                                    <>
                                        {lastEvent.data.status && ` - Statut: ${lastEvent.data.status}`}
                                        {lastEvent.data.taskId && ` - Tâche: ${lastEvent.data.taskId.substring(0, 8)}...`}
                                        {lastEvent.data.files && ` (${lastEvent.data.files.length} fichier(s))`}
                                    </>
                                )}
                                {lastEvent.message && ` - ${lastEvent.message}`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {lastEvent.timestamp ? new Date(lastEvent.timestamp).toLocaleString() : 'Maintenant'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Galerie horizontale avec défilement pour toutes les images */}
            {displayedImages.length > 0 ? (
                <div className="relative">
                    <h3 className="text-lg font-medium text-gray-700 mb-6 text-center">
                        Images générées ({displayedImages.length})
                    </h3>
                    <div className="overflow-x-auto gallery-scrollbar">
                        <div className="flex space-x-6 pb-4 px-4" style={{ width: 'max-content' }}>
                            {displayedImages.map((image, index) => (
                                <div 
                                    key={image.taskId}
                                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer flex-shrink-0"
                                    onClick={() => setSelectedImage(image)}
                                    style={{ width: '400px' }}
                                >
                                    <div className="relative w-full" style={{ height: '50vh', minHeight: '400px', maxHeight: '600px' }}>
                                        <Image
                                            src={image.imageUrl}
                                            alt={image.filename}
                                            fill
                                            className="object-contain"
                                            sizes="400px"
                                            priority={index === 0}
                                        />
                                        <div className={`absolute top-4 left-4 text-white text-sm px-3 py-1 rounded-full font-medium ${
                                            index === 0 
                                                ? 'bg-blue-500' 
                                                : 'bg-black bg-opacity-60'
                                        }`}>
                                            {index === 0 ? 'Dernière' : `#${index + 1}`}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-sm font-medium text-gray-800 truncate">
                                            {image.filename}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(image.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Indicateurs de défilement */}
                    {displayedImages.length > 2 && (
                        <>
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white px-3 py-2 rounded-lg text-xs animate-pulse pointer-events-none">
                                <div className="flex items-center space-x-1">
                                    <span className="animate-bounce">←</span>
                                    <span>Défilez</span>
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white px-3 py-2 rounded-lg text-xs animate-pulse pointer-events-none">
                                <div className="flex items-center space-x-1">
                                    <span>Défilez</span>
                                    <span className="animate-bounce">→</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="rounded-lg shadow-md p-8 text-center">
                    <div className="flex justify-center mb-6 mt-12">
                        <SiriOrb 
                            size={440} 
                            isActive={isConnected}
                            className="animate-pulse"
                        />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Aucune image générée
                    </h3>
                    <p className="text-sm text-gray-500">
                        {isConnected 
                            ? "En attente de nouvelles images générées..."
                            : "Connectez-vous pour recevoir les images en temps réel"
                        }
                    </p>
                </div>
            )}

            {/* Modal pour afficher l'image en grand */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
                        >
                            ✕
                        </button>
                        <Image
                            src={selectedImage.imageUrl}
                            alt={selectedImage.filename}
                            width={800}
                            height={800}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
                            <div className="font-medium">{selectedImage.filename}</div>
                            <div className="text-sm opacity-75">
                                {new Date(selectedImage.timestamp).toLocaleString()}
                            </div>
                            <div className="text-xs opacity-50 mt-1">
                                Tâche: {selectedImage.taskId}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Affichage du nombre total d'images */}
            {generatedImages.length > maxImages && (
                <div className="text-center text-sm text-gray-500">
                    Affichage de {displayedImages.length} sur {generatedImages.length} images générées
                </div>
            )}
        </div>
    );
}