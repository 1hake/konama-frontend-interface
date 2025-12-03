'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

// Types pour les événements WebSocket
export interface TaskFile {
    id: string;
    taskId: string;
    nodeId: string;
    fileType: string;
    filename: string;
    s3Key: string;
    s3Url: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskEventData {
    taskId: string;
    status: 'PENDING' | 'PROCESSING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
    promptId?: string;
    comfyClientId?: string;
    files?: TaskFile[];
}

export interface WebSocketEvent {
    type: 'task.updated' | 'task.files.uploaded';
    data: TaskEventData;
    timestamp: string;
}

export interface GeneratedImage {
    taskId: string;
    imageUrl: string;
    filename: string;
    timestamp: string;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    lastEvent: WebSocketEvent | null;
    generatedImages: GeneratedImage[];
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    error: string | null;
    connect: () => void;
    disconnect: () => void;
    clearImages: () => void;
}

const WEBSOCKET_URL = 'wss://client.konama.fuzdi.fr/ws';
const API_BASE_URL = 'https://client.konama.fuzdi.fr';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(): UseWebSocketReturn {
    const { session, isAuthenticated } = useAuth();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const shouldReconnectRef = useRef(true);

    const [isConnected, setIsConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [error, setError] = useState<string | null>(null);

    // Fonction pour récupérer les détails d'une tâche
    const fetchTaskDetails = useCallback(async (taskId: string): Promise<string | null> => {
        try {
            if (!session?.token) {
                throw new Error('Token d\'accès manquant');
            }

            console.log(`🔍 Récupération des détails de la tâche: ${taskId}`);
            const url = `${API_BASE_URL}/tasks/${taskId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log(`📡 Réponse API pour tâche ${taskId}:`, response.status);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`📄 Données reçues pour tâche ${taskId}:`, data);
            
            // Essayons d'abord de trouver l'URL dans les fichiers
            if (data.files && data.files.length > 0) {
                const file = data.files[0]; // Prendre le premier fichier
                const imageUrl = file.s3Url || file.sw3Url || file.url || file.imageUrl;
                if (imageUrl) {
                    console.log(`🖼️ URL d'image trouvée dans les fichiers pour tâche ${taskId}:`, imageUrl);
                    return imageUrl;
                }
            }
            
            // Fallback: essayons différentes structures de réponse possibles au niveau racine
            const imageUrl = data.imageUrl || data.url || data.s3Url || data.sw3Url || data.data?.imageUrl || data.data?.url || data.data?.sw3Url;
            
            if (imageUrl) {
                console.log(`🖼️ URL d'image trouvée au niveau racine pour tâche ${taskId}:`, imageUrl);
                return imageUrl;
            } else {
                console.warn(`⚠️ Aucune URL d'image trouvée pour tâche ${taskId}`, data);
                return null;
            }
        } catch (error) {
            console.error(`❌ Erreur lors de la récupération des détails de la tâche ${taskId}:`, error);
            return null;
        }
    }, [session]);

    // Fonction pour traiter les événements WebSocket
    const handleWebSocketEvent = useCallback(async (event: WebSocketEvent) => {
        console.log('📨 Événement WebSocket reçu:', event);
        setLastEvent(event);

        // Si c'est une tâche en statut SUCCESS avec des fichiers
        if (
            event.data.status === 'SUCCESS' && 
            event.data.files && 
            event.data.files.length > 0
        ) {
            try {
                const imageUrl = await fetchTaskDetails(event.data.taskId);
                
                if (imageUrl) {
                    const newImage: GeneratedImage = {
                        taskId: event.data.taskId,
                        imageUrl,
                        filename: event.data.files[0].filename,
                        timestamp: event.timestamp,
                    };

                    setGeneratedImages(prev => [newImage, ...prev]);
                    console.log('🖼️ Nouvelle image générée ajoutée:', newImage);
                }
            } catch (error) {
                console.error('Erreur lors du traitement de l\'image:', error);
            }
        }
    }, [fetchTaskDetails]);

    // Fonction de connexion WebSocket
    const connect = useCallback(() => {
        if (!session?.token || !isAuthenticated) {
            console.warn('⚠️ Tentative de connexion WebSocket sans token d\'authentification');
            return;
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('🔗 WebSocket déjà connecté');
            return;
        }

        try {
            setConnectionStatus('connecting');
            setError(null);

            // Première tentative avec le token en query parameter
            const wsUrl = `${WEBSOCKET_URL}?token=${encodeURIComponent(session.token)}`;
            
            console.log('🔌 Connexion WebSocket en cours...');
            console.log('📍 URL:', WEBSOCKET_URL);
            console.log('🔑 Token présent:', !!session.token);
            
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('✅ WebSocket connecté avec succès');
                setIsConnected(true);
                setConnectionStatus('connected');
                setError(null);
                reconnectAttemptsRef.current = 0;
                
                // Envoyer un message d'authentification si nécessaire
                // (certaines APIs nécessitent un message d'auth après la connexion)
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    try {
                        const authMessage = {
                            type: 'auth',
                            token: session.token
                        };
                        wsRef.current.send(JSON.stringify(authMessage));
                        console.log('🔐 Message d\'authentification envoyé');
                    } catch (authError) {
                        console.log('ℹ️ Message d\'authentification optionnel non envoyé:', authError);
                    }
                }
            };

            wsRef.current.onmessage = (messageEvent) => {
                try {
                    console.log('📨 Message WebSocket reçu:', messageEvent.data);
                    const event: WebSocketEvent = JSON.parse(messageEvent.data);
                    handleWebSocketEvent(event);
                } catch (error) {
                    console.error('❌ Erreur lors du parsing du message WebSocket:', error);
                    console.error('📄 Message reçu:', messageEvent.data);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('🔌 WebSocket fermé - Code:', event.code, 'Raison:', event.reason);
                setIsConnected(false);
                setConnectionStatus('disconnected');
                
                // Codes de fermeture spécifiques
                if (event.code === 1006) {
                    console.log('🔄 Fermeture anormale - tentative de reconnexion');
                } else if (event.code === 1008) {
                    console.log('🚫 Fermeture pour violation de politique (probablement authentification)');
                    setError('Erreur d\'authentification WebSocket');
                } else if (event.code === 1011) {
                    console.log('💥 Fermeture pour erreur serveur');
                }
                
                // Tentative de reconnexion si c'est autorisé
                if (shouldReconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttemptsRef.current++;
                    console.log(`🔄 Tentative de reconnexion ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} dans ${RECONNECT_DELAY}ms`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, RECONNECT_DELAY);
                } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    setError('Échec de la connexion WebSocket après plusieurs tentatives');
                    setConnectionStatus('error');
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('❌ Erreur WebSocket:', error);
                setError('Erreur de connexion WebSocket - Vérifiez votre authentification');
                setConnectionStatus('error');
            };

        } catch (error) {
            console.error('💥 Erreur lors de l\'initialisation du WebSocket:', error);
            setError('Échec de l\'initialisation du WebSocket');
            setConnectionStatus('error');
        }
    }, [session, isAuthenticated, handleWebSocketEvent]);

    // Fonction de déconnexion
    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'Déconnexion volontaire');
            wsRef.current = null;
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
        setError(null);
        console.log('🔌 WebSocket déconnecté');
    }, []);

    // Fonction pour vider la liste des images
    const clearImages = useCallback(() => {
        setGeneratedImages([]);
    }, []);

    // Effet pour gérer la connexion automatique
    useEffect(() => {
        if (isAuthenticated && session?.token) {
            shouldReconnectRef.current = true;
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [isAuthenticated, session?.token, connect, disconnect]);

    // Nettoyage à la destruction du composant
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        lastEvent,
        generatedImages,
        connectionStatus,
        error,
        connect,
        disconnect,
        clearImages,
    };
}