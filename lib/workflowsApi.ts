import { 
  WorkflowsApiClient, 
  WorkflowListResponse, 
  WorkflowDetailResponse, 
  ErrorResponse 
} from '@/types/workflow-api';
import { config } from './config';

/**
 * API Client implementation for workflow service
 */
export class WorkflowsApi implements WorkflowsApiClient {
  constructor(private baseUrl: string) {}

  async listWorkflows(): Promise<WorkflowListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json().catch(() => ({
          error: 'Network Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch workflows');
    }
  }

  async getWorkflowByName(name: string): Promise<WorkflowDetailResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/workflow?name=${encodeURIComponent(name)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error: ErrorResponse = await response.json().catch(() => ({
          error: 'Network Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch workflow: ${name}`);
    }
  }
}

// Create a singleton instance with the configured base URL
export const workflowsApi = new WorkflowsApi(config.workflowApiUrl);