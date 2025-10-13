import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { GenerationProgress, GeneratedImage, ImageGenerationHookReturn, WorkflowGenerationOptions, WorkflowMetadata } from '../types';
import { workflowManager } from '../lib/workflowManager';

export const useImageGeneration = (): ImageGenerationHookReturn => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [availableWorkflows, setAvailableWorkflows] = useState<WorkflowMetadata[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>('flux-krea-dev');
    const wsRef = useRef<WebSocket | null>(null);

    // API configuration from environment variables
    const apiBaseUrl = process.env.NEXT_PUBLIC_COMFY_API_URL || window.location.origin;

    // Load available workflows on mount
    useEffect(() => {
        const workflows = workflowManager.getAvailableWorkflows();
        setAvailableWorkflows(workflows);
    }, []);

    // Helper function to construct API URLs
    const getApiUrl = useCallback((endpoint: string) => {
        const externalApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;
        const isExternalApi = externalApiUrl && !externalApiUrl.includes('localhost');

        if (isExternalApi) {
            // For external APIs (RunPod), use proxy endpoints to avoid CORS
            if (endpoint === '/prompt') {
                return '/api/proxy';
            } else if (endpoint.startsWith('/history/')) {
                const promptId = endpoint.replace('/history/', '');
                return `/api/history?prompt_id=${promptId}`;
            } else if (endpoint.startsWith('/view')) {
                return `/api/view${endpoint.replace('/view', '')}`;
            }
            // Fallback for other endpoints
            return endpoint;
        } else {
            // For local development, use relative paths
            return endpoint;
        }
    }, []);

    // WebSocket connection for real-time updates
    useEffect(() => {
        const connectWebSocket = () => {
            // Construct WebSocket URL based on API base URL or fallback to current host
            const externalApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;
            const isExternalApi = externalApiUrl && !externalApiUrl.includes('localhost');
            const wsUrl = isExternalApi
                ? externalApiUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws'
                : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                toast.success('🔗 WebSocket connecté au serveur', {
                    position: 'bottom-right',
                    autoClose: 3000,
                });
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message:', message);

                    // Toast notification for all WebSocket events
                    toast.info(`📡 WS Event: ${message.type}`, {
                        position: 'bottom-right',
                        autoClose: 2000,
                    });

                    if (message.type === 'progress') {
                        const progressValue = Math.round((message.data.value || 0) * 100);
                        toast.info(`⏳ Progression: ${progressValue}% - Node: ${message.data.node}`, {
                            position: 'bottom-right',
                            autoClose: 2000,
                        });

                        setProgress(prev => ({
                            ...prev,
                            progress: message.data.value,
                            node: message.data.node || prev?.node,
                            promptId: prev?.promptId || '',
                            status: 'executing'
                        }));
                    } else if (message.type === 'executing') {
                        toast.info(`🔄 Exécution en cours - Node: ${message.data.node}`, {
                            position: 'bottom-right',
                            autoClose: 2000,
                        });

                        setProgress(prev => ({
                            ...prev,
                            promptId: prev?.promptId || '',
                            status: 'executing',
                            node: message.data.node
                        }));
                    } else if (message.type === 'executed') {
                        toast.success(`✅ Génération terminée!`, {
                            position: 'bottom-right',
                            autoClose: 3000,
                        });

                        // Generation completed
                        checkImages(progress?.promptId || '');
                    } else if (message.type === 'status') {
                        toast.info(`📊 Statut: ${JSON.stringify(message.data)}`, {
                            position: 'bottom-right',
                            autoClose: 3000,
                        });
                    } else {
                        // Log any other WebSocket events
                        toast.info(`🔍 Événement WebSocket: ${message.type} - ${JSON.stringify(message.data).substring(0, 50)}...`, {
                            position: 'bottom-right',
                            autoClose: 4000,
                        });
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    toast.error(`❌ Erreur WebSocket: ${error}`, {
                        position: 'bottom-right',
                        autoClose: 5000,
                    });
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                toast.warning('🔌 WebSocket déconnecté - Reconnexion dans 3s...', {
                    position: 'bottom-right',
                    autoClose: 3000,
                });
                // Reconnect after 3 seconds
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                toast.error(`🚨 Erreur WebSocket: ${error}`, {
                    position: 'bottom-right',
                    autoClose: 5000,
                });
            };
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const checkImages = useCallback(async (promptId: string) => {
        try {
            const response = await fetch(getApiUrl(`/history/${promptId}`));
            const data = await response.json();

            if (data[promptId]?.outputs) {
                const images: GeneratedImage[] = [];

                Object.values(data[promptId].outputs).forEach((output: any) => {
                    if (output.images) {
                        images.push(...output.images);
                    }
                });

                setGeneratedImages(images);

                if (images.length > 0) {
                    toast.success(`🖼️ ${images.length} image(s) générée(s) avec succès!`, {
                        position: 'bottom-right',
                        autoClose: 5000,
                    });
                }
            }
        } catch (error) {
            console.error('Error checking images:', error);
            toast.error(`❌ Erreur lors de la vérification des images`, {
                position: 'bottom-right',
                autoClose: 5000,
            });
        }
    }, [getApiUrl]);

    const pollForCompletion = useCallback(async (promptId: string) => {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(getApiUrl(`/history/${promptId}`));
                const data = await response.json();

                if (data[promptId]) {
                    // Generation completed
                    setProgress(prev => ({
                        ...prev,
                        promptId,
                        status: 'completed'
                    }));

                    await checkImages(promptId);
                    setIsGenerating(false);
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000); // Check every 5 seconds
                } else {
                    throw new Error('Timeout waiting for generation');
                }
            } catch (error) {
                console.error('Error polling for completion:', error);
                setError('Erreur lors de la vérification du statut');
                setIsGenerating(false);
            }
        };

        setTimeout(poll, 2000); // Start polling after 2 seconds
    }, [checkImages, getApiUrl]);

    const generateImage = useCallback(async (prompt: string, negativePrompt: string = '', options: WorkflowGenerationOptions = {}) => {
        const { steps = 20, workflowId } = options;
        if (!prompt.trim()) {
            setError('Veuillez entrer un prompt');
            return;
        }

        // Determine which workflow to use
        const activeWorkflowId = workflowId || selectedWorkflow || 'flux-krea-dev';
        const workflowMetadata = workflowManager.getWorkflowMetadata(activeWorkflowId);

        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);
        setProgress(null);

        toast.info(`🎨 Démarrage génération ${workflowMetadata?.name || activeWorkflowId} (${steps} étapes)`, {
            position: 'bottom-right',
            autoClose: 4000,
        });

        try {
            // Generate workflow JSON using workflow manager
            const workflow = workflowManager.generateWorkflowJson(activeWorkflowId, prompt, negativePrompt, options);
            const requestBody = {
                prompt: workflow,
                client_id: Math.random().toString(36).substring(7)
            };
            const url = getApiUrl('/prompt');

            console.log('=== FRONTEND REQUEST START ===');
            console.log('🎯 Making request to:', url);
            console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('📥 Response status:', response.status, response.statusText);
            console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Frontend request failed:');
                console.error('   Status:', response.status);
                console.error('   Status Text:', response.statusText);
                console.error('   Response Text:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Frontend request successful:');
            console.log('📤 Response data:', JSON.stringify(data, null, 2));
            console.log('=== FRONTEND REQUEST END ===');

            if (data.prompt_id) {
                toast.success(`🎯 Prompt accepté! ID: ${data.prompt_id}`, {
                    position: 'bottom-right',
                    autoClose: 3000,
                });

                setProgress({
                    promptId: data.prompt_id,
                    status: 'queued'
                });

                // Poll for completion
                await pollForCompletion(data.prompt_id);
            }
        } catch (error) {
            console.error('=== FRONTEND ERROR ===');
            console.error('❌ Error generating image:', error);
            console.error('Error type:', typeof error);
            console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
            console.error('Error message:', error instanceof Error ? error.message : String(error));
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('=== END FRONTEND ERROR ===');

            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(`💥 Erreur de génération: ${errorMessage}`, {
                position: 'bottom-right',
                autoClose: 8000,
            });

            setError('Erreur lors de la génération de l\'image');
            setIsGenerating(false);
        }
    }, [pollForCompletion, getApiUrl, selectedWorkflow]);

    const resetGeneration = useCallback(() => {
        setGeneratedImages([]);
        setError(null);
        setProgress(null);
        setIsGenerating(false);

        toast.info('🔄 Génération réinitialisée', {
            position: 'bottom-right',
            autoClose: 2000,
        });
    }, []);

    return {
        isGenerating,
        progress,
        generatedImages,
        error,
        availableWorkflows,
        selectedWorkflow,
        setSelectedWorkflow,
        generateImage,
        resetGeneration,
    };
};