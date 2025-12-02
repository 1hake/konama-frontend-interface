import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    GenerationProgress,
    GeneratedImage,
    WorkflowGenerationOptions,
} from '../types';
import { config } from '../lib/config';

interface SimpleImageGenerationHookReturn {
    isGenerating: boolean;
    progress: GenerationProgress | null;
    generatedImages: GeneratedImage[];
    error: string | null;
    generateImage: (
        prompt: string,
        negativePrompt?: string,
        options?: WorkflowGenerationOptions
    ) => Promise<void>;
    resetGeneration: () => void;
}

export const useImageGeneration = (): SimpleImageGenerationHookReturn => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(
        []
    );
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Helper function to construct API URLs
    const getApiUrl = useCallback((endpoint: string) => {
        console.log('🔗 getApiUrl called with endpoint:', endpoint);

        // Always use proxy for /prompt endpoint to avoid CORS issues
        if (endpoint === '/prompt') {
            console.log('✅ Using proxy for /prompt endpoint');
            return '/api/proxy';
        }

        // Always use proxy for /history endpoint to avoid CORS issues
        if (endpoint.startsWith('/history/')) {
            const promptId = endpoint.replace('/history/', '');
            console.log(
                '✅ Using proxy for /history endpoint, promptId:',
                promptId
            );
            return `/api/history?prompt_id=${promptId}`;
        }

        // Always use proxy for /view endpoint to avoid CORS issues
        if (endpoint.startsWith('/view')) {
            console.log('✅ Using proxy for /view endpoint');
            return `/api/view${endpoint.replace('/view', '')}`;
        }

        // For any other endpoints, use direct ComfyUI URL (rare cases)
        if (config.isExternalApi) {
            // Fallback for external APIs
            return endpoint;
        } else {
            // For local ComfyUI, use direct endpoints for other cases
            const url = `${config.comfyApiUrl}${endpoint}`;
            console.log('🏠 Using local ComfyUI endpoint:', url);
            return url;
        }
    }, []);

    // WebSocket connection for real-time updates
    useEffect(() => {
        // Re-enabled WebSocket connection
        const connectWebSocket = () => {
            const wsUrl = config.getWebSocketUrl();
            console.log('🔌 Connecting to WebSocket:', wsUrl);

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
            };

            wsRef.current.onmessage = event => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message:', message);

                    if (message.type === 'progress') {
                        setProgress(prev => ({
                            ...prev,
                            progress: message.data.value,
                            node: message.data.node || prev?.node,
                            promptId: prev?.promptId || '',
                            status: 'executing',
                        }));
                    } else if (message.type === 'executing') {
                        setProgress(prev => ({
                            ...prev,
                            promptId: prev?.promptId || '',
                            status: 'executing',
                            node: message.data.node,
                        }));
                    } else if (message.type === 'executed') {
                        // Generation completed
                        checkImages(progress?.promptId || '');
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    // Only show error if it's critical
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                // Reconnect after 3 seconds
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current.onerror = error => {
                console.error('WebSocket error:', error);
            };
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const checkImages = useCallback(
        async (promptId: string) => {
            try {
                const response = await axios.get(
                    getApiUrl(`/history/${promptId}`)
                );
                const data = response.data;

                if (data[promptId]?.outputs) {
                    const images: GeneratedImage[] = [];

                    Object.values(data[promptId].outputs).forEach(
                        (output: any) => {
                            if (output.images) {
                                images.push(...output.images);
                            }
                        }
                    );

                    setGeneratedImages(images);

                    // Clear progress after images are loaded
                    setTimeout(() => {
                        setProgress(null);
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking images:', error);
            }
        },
        [getApiUrl]
    );

    const pollForCompletion = useCallback(
        async (promptId: string) => {
            const maxAttempts = 60; // 5 minutes max
            let attempts = 0;

            const poll = async () => {
                try {
                    const response = await axios.get(
                        getApiUrl(`/history/${promptId}`)
                    );
                    const data = response.data;

                    if (data[promptId]) {
                        // Generation completed
                        setProgress(prev => ({
                            ...prev,
                            promptId,
                            status: 'completed',
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
                    setError('Generation failed');
                    setIsGenerating(false);
                }
            };

            setTimeout(poll, 2000); // Start polling after 2 seconds
        },
        [checkImages, getApiUrl]
    );

    const generateImage = useCallback(
        async (
            prompt: string,
            negativePrompt: string = '',
            options: WorkflowGenerationOptions = {}
        ) => {
            const { steps = 20, workflowId } = options;

            if (!prompt.trim()) {
                setError('Please enter a prompt');
                return;
            }

            if (!workflowId) {
                setError('Please select a workflow');
                return;
            }

            setIsGenerating(true);
            setError(null);
            setGeneratedImages([]);
            setProgress(null);

            try {
                // Send the prompt directly to our API endpoint which handles the Konama API call
                const response = await axios.post(
                    `/api/workflows/${workflowId}/prompt`,
                    {
                        positivePrompt: prompt,
                        negativePrompt: negativePrompt || 'text, watermark',
                        options: { steps, ...options },
                    }
                );

                console.log('=== GENERATION REQUEST SUCCESS ===');
                console.log('📥 Response status:', response.status, response.statusText);
                console.log('📋 Response data:', response.data);

                const data = response.data;

                // Set the prompt ID from the response
                if (data.prompt_id) {
                    setProgress({
                        promptId: data.prompt_id,
                        status: 'queued',
                    });

                    // Start polling for completion if using WebSocket fallback
                    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                        await pollForCompletion(data.prompt_id);
                    }
                } else {
                    // If no prompt_id, assume immediate completion
                    setIsGenerating(false);
                    setProgress(null);
                }

                console.log('=== GENERATION REQUEST END ===');

                if (data.prompt_id) {
                    setProgress({
                        promptId: data.prompt_id,
                        status: 'queued',
                    });

                    // Poll for completion
                    await pollForCompletion(data.prompt_id);
                }
            } catch (error) {
                console.error('=== FRONTEND ERROR ===');
                console.error('❌ Error generating image:', error);
                console.error('Error type:', typeof error);
                console.error(
                    'Error name:',
                    error instanceof Error ? error.name : 'Unknown'
                );
                console.error(
                    'Error message:',
                    error instanceof Error ? error.message : String(error)
                );
                console.error(
                    'Error stack:',
                    error instanceof Error ? error.stack : 'No stack trace'
                );
                console.error('=== END FRONTEND ERROR ===');

                setError('Generation failed');
                setIsGenerating(false);
            }
        },
        [pollForCompletion, getApiUrl]
    );

    const resetGeneration = useCallback(() => {
        setGeneratedImages([]);
        setError(null);
        setProgress(null);
        setIsGenerating(false);
    }, []);

    return {
        isGenerating,
        progress,
        generatedImages,
        error,
        generateImage,
        resetGeneration,
    };
};
