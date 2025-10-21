import { useState, useEffect, useCallback } from 'react';
import { WorkflowMetadata } from '../types';

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
                response = await fetch('http://localhost:4000/workflows');
            } catch (directError) {
                // If direct connection fails, try through our proxy
                console.log('Direct connection failed, trying proxy...');
                response = await fetch('/api/workflows');
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch workflows: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different response formats and transform workflow files into WorkflowMetadata
            let workflowsData: WorkflowMetadata[] = [];

            if (Array.isArray(data)) {
                // Direct array of workflows
                workflowsData = data;
            } else if (data.data && Array.isArray(data.data)) {
                // Wrapped in 'data' array - contains workflow file objects
                workflowsData = data.data.map((workflowFile: any) => {
                    const filename = workflowFile.content?.name || 'unknown';
                    const workflowContent = workflowFile.content?.content;

                    // Extract workflow ID from filename (remove .json extension)
                    const workflowId = filename.replace(/^workflows\//, '').replace(/\.json$/, '');

                    // Create WorkflowMetadata from the file
                    return {
                        id: workflowId,
                        name: workflowId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                        description: `Workflow: ${workflowId}`,
                        category: 'imported',
                        source: 'api' as const,
                        lastFetched: new Date(),
                        supportsNegativePrompt: true,
                        // You can add more parsing logic here based on workflowContent if needed
                        tags: [workflowId.includes('flux') ? 'flux' : 'stable-diffusion']
                    } as WorkflowMetadata;
                });
            } else if (data.workflows && Array.isArray(data.workflows)) {
                // Wrapped in 'workflows' property
                workflowsData = data.workflows;
            } else {
                console.warn('Unexpected response format:', data);
                workflowsData = [];
            }

            setWorkflows(workflowsData);
            console.log(`✅ Successfully loaded ${workflowsData.length} workflows:`, workflowsData);
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