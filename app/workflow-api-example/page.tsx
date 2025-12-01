/**
 * Example demonstrating how to use the new Workflow API
 * 
 * This file shows how to:
 * 1. Fetch workflows from the API using useWorkflowsApi hook
 * 2. Display them using the WorkflowList component
 * 3. Get detailed workflow data when needed
 */

'use client';

import React, { useState } from 'react';
import { useWorkflowsApi } from '@/hooks';
import { WorkflowList } from '@/components';
import { WorkflowData } from '@/types/workflow-api';

export default function WorkflowApiExample() {
  const { fetchWorkflowByName } = useWorkflowsApi();
  const [selectedWorkflowData, setSelectedWorkflowData] = useState<WorkflowData | null>(null);
  const [selectedWorkflowName, setSelectedWorkflowName] = useState<string>('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleWorkflowSelect = async (workflowName: string) => {
    setSelectedWorkflowName(workflowName);
    setIsLoadingDetails(true);
    
    try {
      const workflowData = await fetchWorkflowByName(workflowName);
      setSelectedWorkflowData(workflowData);
    } catch (error) {
      console.error('Failed to fetch workflow details:', error);
      setSelectedWorkflowData(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Workflow API Example</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <WorkflowList 
            onWorkflowSelect={handleWorkflowSelect}
            selectedWorkflow={selectedWorkflowName}
          />
        </div>

        {/* Workflow Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Details</h3>
          
          {!selectedWorkflowName ? (
            <p className="text-gray-500">Select a workflow to see details</p>
          ) : isLoadingDetails ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading details...</span>
            </div>
          ) : selectedWorkflowData ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{selectedWorkflowData.name || selectedWorkflowName}</p>
              </div>
              
              {selectedWorkflowData.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description:</label>
                  <p className="text-gray-900">{selectedWorkflowData.description}</p>
                </div>
              )}
              
              {selectedWorkflowData.version && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Version:</label>
                  <p className="text-gray-900">{selectedWorkflowData.version}</p>
                </div>
              )}
              
              {selectedWorkflowData.nodes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Nodes:</label>
                  <p className="text-gray-900">{selectedWorkflowData.nodes.length} nodes</p>
                </div>
              )}
              
              {selectedWorkflowData.metadata && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Metadata:</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedWorkflowData.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Raw workflow data (for debugging) */}
              <details className="mt-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Raw Workflow Data
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64 mt-2">
                  {JSON.stringify(selectedWorkflowData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-red-500">Failed to load workflow details</p>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">How to use this API</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Import the hook:</strong> <code className="bg-blue-100 px-1 rounded">import useWorkflowsApi from hooks</code></p>
          <p><strong>2. Use in component:</strong> <code className="bg-blue-100 px-1 rounded">const workflows = useWorkflowsApi()</code></p>
          <p><strong>3. List workflows:</strong> Workflows are automatically fetched on mount</p>
          <p><strong>4. Get workflow details:</strong> <code className="bg-blue-100 px-1 rounded">await fetchWorkflowByName(name)</code></p>
        </div>
      </div>
    </div>
  );
}