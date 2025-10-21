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

                    // Extract workflow ID from the content if available
                    const workflowId = workflowContent?.id || `workflow-${index}`;

                    // Create a metadata object from the workflow file
                    const metadata: WorkflowMetadata = {
                        id: workflowId,
                        name: workflowName.replace(/^workflows\//, '').replace(/\.json$/, ''), // Clean up the name
                        description: `Workflow from ${workflowName}`,
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