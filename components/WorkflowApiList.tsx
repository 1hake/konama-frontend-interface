import React from 'react';
import { useWorkflowsApi } from '@/hooks';
import { WorkflowSummary } from '@/types/workflow-api';

interface WorkflowListProps {
  onWorkflowSelect?: (workflowName: string) => void;
  selectedWorkflow?: string;
}

/**
 * Component that displays a list of workflows fetched from the API
 */
export function WorkflowList({ onWorkflowSelect, selectedWorkflow }: WorkflowListProps) {
  const { workflows, isLoading, error, fetchWorkflows, clearError } = useWorkflowsApi();

  const handleWorkflowClick = (workflow: WorkflowSummary) => {
    if (onWorkflowSelect) {
      onWorkflowSelect(workflow.name);
    }
  };

  const handleRetry = () => {
    clearError();
    fetchWorkflows();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading workflows...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-800">Failed to load workflows</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!workflows.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No workflows available</p>
        <button
          onClick={fetchWorkflows}
          className="mt-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Available Workflows</h3>
        <button
          onClick={fetchWorkflows}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-2">
        {workflows.map((workflow) => (
          <button
            key={workflow.name}
            onClick={() => handleWorkflowClick(workflow)}
            className={`p-3 text-left border rounded-lg transition-colors ${
              selectedWorkflow === workflow.name
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{workflow.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}