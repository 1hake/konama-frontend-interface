import { useState, useEffect, useRef, useCallback } from 'react';
import { GenerationProgress, GeneratedImage, WorkflowGenerationOptions } from '../types';
import { config } from '../lib/config';

interface SimpleImageGenerationHookReturn {
    isGenerating: boolean;
    progress: GenerationProgress | null;
    generatedImages: GeneratedImage[];
    error: string | null;
    generateImage: (prompt: string, negativePrompt?: string, options?: WorkflowGenerationOptions) => Promise<void>;
    resetGeneration: () => void;
}

export const useImageGeneration = (): SimpleImageGenerationHookReturn => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<GenerationProgress | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Helper function to construct API URLs
    const getApiUrl = useCallback((endpoint: string) => {
        if (config.isExternalApi) {
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
            // For local ComfyUI, use direct endpoints with the configured URL
            return `${config.comfyApiUrl}${endpoint}`;
        }
    }, []);

    // WebSocket connection for real-time updates
    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = config.getWebSocketUrl();

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message:', message);

                    if (message.type === 'progress') {
                        setProgress(prev => ({
                            ...prev,
                            progress: message.data.value,
                            node: message.data.node || prev?.node,
                            promptId: prev?.promptId || '',
                            status: 'executing'
                        }));
                    } else if (message.type === 'executing') {
                        setProgress(prev => ({
                            ...prev,
                            promptId: prev?.promptId || '',
                            status: 'executing',
                            node: message.data.node
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

            wsRef.current.onerror = (error) => {
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

                // Images loaded successfully - no toast needed
            }
        } catch (error) {
            console.error('Error checking images:', error);
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
                setError('Generation failed');
                setIsGenerating(false);
            }
        };

        setTimeout(poll, 2000); // Start polling after 2 seconds
    }, [checkImages, getApiUrl]);

    const generateImage = useCallback(async (prompt: string, negativePrompt: string = '', options: WorkflowGenerationOptions = {}) => {
        const { steps = 20, workflowId = 'flux-krea-dev' } = options;
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);
        setProgress(null);

        try {
            // Use the workflow service to get the workflow JSON
            const workflowResponse = await fetch(`${config.workflowApiUrl}/workflows/${workflowId}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    positivePrompt: prompt,
                    negativePrompt: negativePrompt || 'text, watermark',
                    options: { steps, ...options }
                }),
            });

            if (!workflowResponse.ok) {
                throw new Error(`Failed to generate workflow: ${workflowResponse.status} ${workflowResponse.statusText}`);
            }

            const workflow = await workflowResponse.json();

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

            setError('Generation failed');
            setIsGenerating(false);
        }
    }, [pollForCompletion, getApiUrl]);

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