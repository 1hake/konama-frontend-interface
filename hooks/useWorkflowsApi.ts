import { useState, useEffect, useCallback } from 'react';
import { workflowsApi } from '@/lib/workflowsApi';
import { 
  WorkflowListResponse, 
  WorkflowDetailResponse, 
  WorkflowSummary, 
  WorkflowData 
} from '@/types/workflow-api';

interface UseWorkflowsApiReturn {
  // State
  workflows: WorkflowSummary[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWorkflows: () => Promise<void>;
  fetchWorkflowByName: (name: string) => Promise<WorkflowData | null>;
  clearError: () => void;
}

/**
 * Hook for managing workflow API calls
 */
export function useWorkflowsApi(): UseWorkflowsApiReturn {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: WorkflowListResponse = await workflowsApi.listWorkflows();
      setWorkflows(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workflows';
      setError(errorMessage);
      console.error('Failed to fetch workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWorkflowByName = useCallback(async (name: string): Promise<WorkflowData | null> => {
    try {
      setError(null);
      
      const response: WorkflowDetailResponse = await workflowsApi.getWorkflowByName(name);
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch workflow: ${name}`;
      setError(errorMessage);
      console.error(`Failed to fetch workflow ${name}:`, err);
      return null;
    }
  }, []);

  // Auto-fetch workflows on mount
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    isLoading,
    error,
    fetchWorkflows,
    fetchWorkflowByName,
    clearError,
  };
}