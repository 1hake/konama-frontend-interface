import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/auth';
import {
  WorkflowData,
  UserPromptInput,
  PromptSubmissionPayload,
} from '@/types/workflow-api';
import {
  injectPromptIntoWorkflow,
  generateComfyClientId,
  validateWorkflowStructure,
} from '@/lib/workflowPromptInjector';

interface UseWorkflowSubmissionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface SubmitWorkflowParams {
  workflowId: string;
  workflowData: WorkflowData;
  userPrompt: UserPromptInput;
  mode?: 'slow' | 'fast';
}

export function useWorkflowSubmission(options: UseWorkflowSubmissionOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<any>(null);

  /**
   * Submits a workflow with user prompts to the backend
   */
  const submitWorkflow = useCallback(
    async ({
      workflowId,
      workflowData,
      userPrompt,
      mode = 'slow',
    }: SubmitWorkflowParams) => {
      setIsSubmitting(true);
      setError(null);
      setResponse(null);

      try {
        console.log('🚀 Starting workflow submission:', workflowId);

        // Validate workflow structure
        const validation = validateWorkflowStructure(workflowData);
        if (!validation.valid) {
          throw new Error(
            `Invalid workflow structure: ${validation.errors.join(', ')}`
          );
        }

        // Inject user prompts into the workflow
        const modifiedWorkflow = injectPromptIntoWorkflow(workflowData, userPrompt);

        // Generate unique client ID
        const comfyClientId = generateComfyClientId();

        // Prepare submission payload
        const payload: PromptSubmissionPayload = {
          workflow_id: workflowId,
          mode,
          prompt: modifiedWorkflow,
          comfyClientId,
        };

        console.log('📦 Submission payload prepared:', {
          workflow_id: workflowId,
          mode,
          comfyClientId,
          nodeCount: modifiedWorkflow.nodes.length,
        });

        // Submit to backend via API route
        const { data } = await apiClient.post('/submit-workflow', payload);

        console.log('✅ Workflow submitted successfully:', data);
        setResponse(data);

        // Call success callback if provided
        options.onSuccess?.(data);

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        console.error('❌ Workflow submission failed:', error);
        setError(error);

        // Call error callback if provided
        options.onError?.(error);

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  /**
   * Resets the submission state
   */
  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setResponse(null);
  }, []);

  return {
    submitWorkflow,
    isSubmitting,
    error,
    response,
    reset,
  };
}
