import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/auth';
import { WorkflowMetadata } from '../types';
import { config } from '../lib/config';

export const useWorkflows = () => {
    const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Use authenticated API client to call our proxy endpoint
            const response = await apiClient.get('/workflows');

            const data = response.data;
            console.log('Raw workflow data:', data);

            // Handle the specific structure from workflow service
            let workflowsData: WorkflowMetadata[] = [];

            if (data.data && Array.isArray(data.data)) {
                // Parse workflow names from the new API structure
                workflowsData = data.data
                    .map((item: any) => {
                        const workflowName = item.name;
                        if (!workflowName) return null;

                        // Create a metadata object from the workflow name
                        const workflowId = workflowName;
                        const displayName = workflowName
                            .replace(/-/g, ' ')
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/\b\w/g, (l: string) => l.toUpperCase())
                            .trim();

                        // Create a metadata object for the workflow
                        const metadata: WorkflowMetadata = {
                            id: workflowId,
                            name: displayName,
                            description: `${displayName} workflow`,
                            category: workflowName.toLowerCase().includes('flux')
                                ? 'flux'
                                : workflowName.toLowerCase().includes('basic')
                                ? 'basic'
                                : 'stable-diffusion',
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
                                    step: 1,
                                },
                                {
                                    name: 'guidance',
                                    label: 'Guidance',
                                    type: 'slider' as const,
                                    defaultValue: 3.5,
                                    min: 1,
                                    max: 10,
                                    step: 0.1,
                                },
                            ],
                        };

                        return metadata;
                    })
                    .filter(Boolean);
            } else if (Array.isArray(data)) {
                // Handle direct array format (fallback)
                workflowsData = data;
            } else if (data.workflows && Array.isArray(data.workflows)) {
                // Handle wrapped format (proxy)
                workflowsData = data.workflows;
            }

            setWorkflows(workflowsData);
            console.log(
                `✅ Successfully loaded ${workflowsData.length} workflows:`,
                workflowsData.map(w => w.name)
            );

            // Fetch full workflow details for each workflow
            if (workflowsData.length > 0) {
                console.log('🔄 Fetching full workflow details...');
                const detailsPromises = workflowsData.map(async (workflow) => {
                    try {
                        const detailResponse = await apiClient.get(
                            `/workflows/${workflow.id}`
                        );
                        console.log(`✅ Fetched details for: ${workflow.name}`, detailResponse.data);
                        
                        // Update the workflow object with details
                        return {
                            ...workflow,
                            details: detailResponse.data.data || detailResponse.data
                        };
                    } catch (err) {
                        console.error(`❌ Failed to fetch details for ${workflow.name}:`, err);
                        return workflow; // Return without details if fetch fails
                    }
                });

                const workflowsWithDetails = await Promise.all(detailsPromises);
                console.log('✅ All workflow details fetched:', workflowsWithDetails);
                
                // Update the state with workflows that now have details
                setWorkflows(workflowsWithDetails);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch workflows';
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

    const fetchWorkflowByName = useCallback(async (workflowName: string) => {
        try {
            console.log(`🔍 Fetching workflow: ${workflowName}`);
            
            let response;
            try {
                response = await apiClient.get(
                    `${config.workflowApiUrl}/workflows/workflow?name=${encodeURIComponent(workflowName)}`
                );
            } catch (directError) {
                // If direct connection fails, try through our proxy
                console.log('Direct connection failed, trying proxy...');
                response = await apiClient.get(
                    `/api/workflows/workflow?name=${encodeURIComponent(workflowName)}`
                );
            }

            console.log(`✅ Successfully fetched workflow: ${workflowName}`);
            return response.data;
        } catch (err) {
            console.error(`❌ Failed to fetch workflow ${workflowName}:`, err);
            throw err;
        }
    }, []);

    return {
        workflows,
        loading,
        error,
        refreshWorkflows,
        fetchWorkflowByName,
    };
};
