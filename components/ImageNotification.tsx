'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket, GeneratedImage } from '@/hooks/useWebSocket';
import Image from 'next/image';

interface ImageNotificationProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration?: number;
    maxNotifications?: number;
}

interface NotificationItem {
    id: string;
    image: GeneratedImage;
    timestamp: number;
}

export function ImageNotification({ 
    position = 'top-right',
    duration = 5000,
    maxNotifications = 3
}: ImageNotificationProps) {
    const { generatedImages } = useWebSocket();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [lastProcessedIndex, setLastProcessedIndex] = useState(0);

    // Positions CSS pour les notifications
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
    };

    // Surveiller les nouvelles images
    useEffect(() => {
        if (generatedImages.length > lastProcessedIndex) {
            const newImages = generatedImages.slice(lastProcessedIndex);
            
            newImages.forEach((image) => {
                const notification: NotificationItem = {
                    id: `${image.taskId}-${Date.now()}`,
                    image,
                    timestamp: Date.now(),
                };

                setNotifications(prev => {
                    // Limiter le nombre de notifications
                    const updated = [notification, ...prev].slice(0, maxNotifications);
                    return updated;
                });

                // Auto-suppression après la durée spécifiée
                setTimeout(() => {
                    setNotifications(prev => 
                        prev.filter(n => n.id !== notification.id)
                    );
                }, duration);
            });

            setLastProcessedIndex(generatedImages.length);
        }
    }, [generatedImages, lastProcessedIndex, duration, maxNotifications]);

    // Fonction pour fermer une notification manuellement
    const closeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className={`fixed ${positionClasses[position]} z-50 space-y-2 pointer-events-none`}>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-sm pointer-events-auto transform transition-all duration-300 ease-in-out animate-slide-in"
                >
                    <div className="flex items-start space-x-3">
                        {/* Miniature de l'image */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                                src={notification.image.imageUrl}
                                alt={notification.image.filename}
                                fill
                                className="object-cover rounded-md"
                                sizes="64px"
                            />
                        </div>

                        {/* Contenu de la notification */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        🎉 Nouvelle image générée
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {notification.image.filename}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(notification.image.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                
                                {/* Bouton fermer */}
                                <button
                                    onClick={() => closeNotification(notification.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression pour montrer le temps restant */}
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                                className="bg-blue-500 h-1 rounded-full animate-shrink"
                                style={{ 
                                    animationDuration: `${duration}ms`,
                                    animationTimingFunction: 'linear',
                                    animationFillMode: 'forwards'
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                .animate-shrink {
                    animation: shrink linear;
                }
            `}</style>
        </div>
    );
}