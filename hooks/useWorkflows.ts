import { useState, useEffect, useCallback } from 'react';
import { WorkflowMetadata } from '../types';
import { config } from '../lib/config';

export const useWorkflows = () => {
    const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Mock mode for testing without endpoints
        if (config.mockWorkflows) {
            console.log('🎭 MOCK MODE: Using fake workflows...');

            const mockWorkflows: WorkflowMetadata[] = [
                {
                    id: 'flux-dev-mock',
                    name: 'Flux Dev (Mock)',
                    description: 'Flux.1 Dev model for high-quality image generation (Mock Data)',
                    category: 'flux',
                    version: '1.0.0',
                    supportsNegativePrompt: true,
                    source: 'local' as const,
                    lastFetched: new Date(),
                    tags: ['flux', 'dev', 'high-quality', 'mock'],
                    author: 'Mock System',
                    requiredModels: ['flux1-dev.safetensors'],
                    parameters: [
                        {
                            name: 'steps',
                            label: 'Steps',
                            type: 'slider' as const,
                            defaultValue: 20,
                            min: 1,
                            max: 50,
                            step: 1
                        },
                        {
                            name: 'guidance',
                            label: 'Guidance',
                            type: 'slider' as const,
                            defaultValue: 3.5,
                            min: 1,
                            max: 10,
                            step: 0.1
                        }
                    ]
                },
                {
                    id: 'sd15-basic-mock',
                    name: 'Stable Diffusion 1.5 (Mock)',
                    description: 'Basic SD 1.5 workflow for quick generations (Mock Data)',
                    category: 'stable-diffusion',
                    version: '1.0.0',
                    supportsNegativePrompt: true,
                    source: 'local' as const,
                    lastFetched: new Date(),
                    tags: ['sd15', 'basic', 'fast', 'mock'],
                    author: 'Mock System',
                    requiredModels: ['v1-5-pruned-emaonly.safetensors'],
                    parameters: [
                        {
                            name: 'steps',
                            label: 'Steps',
                            type: 'slider' as const,
                            defaultValue: 20,
                            min: 1,
                            max: 50,
                            step: 1
                        },
                        {
                            name: 'cfg',
                            label: 'CFG Scale',
                            type: 'slider' as const,
                            defaultValue: 7,
                            min: 1,
                            max: 20,
                            step: 0.5
                        }
                    ]
                },
                {
                    id: 'sdxl-turbo-mock',
                    name: 'SDXL Turbo (Mock)',
                    description: 'Fast SDXL Turbo workflow for rapid prototyping (Mock Data)',
                    category: 'stable-diffusion',
                    version: '1.0.0',
                    supportsNegativePrompt: false,
                    source: 'local' as const,
                    lastFetched: new Date(),
                    tags: ['sdxl', 'turbo', 'fast', 'mock'],
                    author: 'Mock System',
                    requiredModels: ['sd_xl_turbo_1.0.safetensors'],
                    parameters: [
                        {
                            name: 'steps',
                            label: 'Steps',
                            type: 'slider' as const,
                            defaultValue: 4,
                            min: 1,
                            max: 10,
                            step: 1
                        }
                    ]
                }
            ];

            setWorkflows(mockWorkflows);
            setLoading(false);
            console.log(`✅ MOCK MODE: Loaded ${mockWorkflows.length} fake workflows`);
            return;
        }

        try {
            // Try direct connection first
            let response;
            try {
                response = await fetch(`${config.workflowApiUrl}/workflows`);
            } catch (directError) {
                // If direct connection fails, try through our proxy
                console.log('Direct connection failed, trying proxy...');
                response = await fetch('/api/workflows');
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch workflows: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Raw workflow data:', data);

            // Handle the specific structure from workflow service
            let workflowsData: WorkflowMetadata[] = [];

            if (data.data && Array.isArray(data.data)) {
                // Parse the workflow files from the external service
                workflowsData = data.data.map((item: any, index: number) => {
                    const workflowName = item.content?.name || `Workflow ${index + 1}`;
                    const workflowContent = item.content?.content;

                    // Use the filename (without path and extension) as the workflow ID for easier identification
                    const workflowId = workflowName.replace(/^workflows\//, '').replace(/\.json$/, '');
                    const displayName = workflowId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

                    // Create a metadata object from the workflow file
                    const metadata: WorkflowMetadata = {
                        id: workflowId,
                        name: displayName,
                        description: `${displayName} workflow`,
                        category: workflowName.includes('flux') ? 'flux' : 'stable-diffusion',
                        version: '1.0.0',
                        supportsNegativePrompt: true,
                        source: 'api' as const,
                        lastFetched: new Date(),
                        parameters: [
                            {
                                name: 'steps',
                                label: 'Steps',
                                type: 'slider' as const,
                                defaultValue: 20,
                                min: 1,
                                max: 50,
                                step: 1
                            },
                            {
                                name: 'guidance',
                                label: 'Guidance',
                                type: 'slider' as const,
                                defaultValue: 3.5,
                                min: 1,
                                max: 10,
                                step: 0.1
                            }
                        ]
                    };

                    return metadata;
                }).filter(Boolean);
            } else if (Array.isArray(data)) {
                // Handle direct array format (fallback)
                workflowsData = data;
            } else if (data.workflows && Array.isArray(data.workflows)) {
                // Handle wrapped format (proxy)
                workflowsData = data.workflows;
            }

            setWorkflows(workflowsData);
            console.log(`✅ Successfully loaded ${workflowsData.length} workflows:`, workflowsData.map(w => w.name));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workflows';
            setError(errorMessage);
            console.error('Error fetching workflows:', err);

            // Set empty array as fallback
            setWorkflows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshWorkflows = useCallback(async () => {
        console.log('🔄 Refreshing workflows...');
        await fetchWorkflows();
    }, [fetchWorkflows]);

    useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    return {
        workflows,
        loading,
        error,
        refreshWorkflows
    };
};