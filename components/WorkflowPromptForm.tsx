import React, { useState, useEffect } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowSubmission } from '@/hooks/useWorkflowSubmission';
import { UserPromptInput } from '@/types/workflow-api';

export function WorkflowPromptForm() {
  const { workflows, loading: loadingWorkflows, error: workflowError } = useWorkflows();
  const { submitWorkflow, isSubmitting, error: submissionError, response } = useWorkflowSubmission({
    onSuccess: (data) => {
      console.log('✅ Workflow submitted successfully:', data);
      alert('Workflow submitted successfully! Check the response in console.');
    },
    onError: (error) => {
      console.error('❌ Submission failed:', error);
      alert(`Submission failed: ${error.message}`);
    },
  });

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [positivePrompt, setPositivePrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [mode, setMode] = useState<'slow' | 'fast'>('slow');

  // Set default workflow when workflows load
  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(workflows[0].name);
    }
  }, [workflows, selectedWorkflowId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkflowId) {
      alert('Please select a workflow');
      return;
    }

    if (!positivePrompt.trim()) {
      alert('Please enter a positive prompt');
      return;
    }

    // Find the selected workflow
    const selectedWorkflow = workflows.find((w) => w.name === selectedWorkflowId);

    if (!selectedWorkflow) {
      alert('Selected workflow not found');
      return;
    }

    // Check if workflow details are loaded
    if (!selectedWorkflow.details) {
      alert('Workflow details not loaded. Please try again.');
      return;
    }

    const userPrompt: UserPromptInput = {
      positive: positivePrompt,
      negative: negativePrompt || undefined,
    };

    try {
      await submitWorkflow({
        workflowId: selectedWorkflowId,
        workflowData: selectedWorkflow.details,
        userPrompt,
        mode,
      });
    } catch (error) {
      // Error already handled by useWorkflowSubmission
      console.error('Error submitting workflow:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Generate Image with Workflow
      </h2>

      {workflowError && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          Error loading workflows: {workflowError}
        </div>
      )}

      {submissionError && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          Submission error: {submissionError.message}
        </div>
      )}

      {response && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          ✅ Workflow submitted successfully! Check console for details.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workflow Selection */}
        <div>
          <label
            htmlFor="workflow"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select Workflow
          </label>
          <select
            id="workflow"
            value={selectedWorkflowId}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            disabled={loadingWorkflows || isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            {loadingWorkflows ? (
              <option>Loading workflows...</option>
            ) : workflows.length === 0 ? (
              <option>No workflows available</option>
            ) : (
              workflows.map((workflow) => (
                <option key={workflow.name} value={workflow.name}>
                  {workflow.name}
                  {workflow.details ? ' ✓' : ' (loading...)'}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generation Mode
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="slow"
                checked={mode === 'slow'}
                onChange={(e) => setMode(e.target.value as 'slow' | 'fast')}
                disabled={isSubmitting}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Slow (Higher Quality)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="fast"
                checked={mode === 'fast'}
                onChange={(e) => setMode(e.target.value as 'slow' | 'fast')}
                disabled={isSubmitting}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Fast</span>
            </label>
          </div>
        </div>

        {/* Positive Prompt */}
        <div>
          <label
            htmlFor="positive-prompt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Positive Prompt *
          </label>
          <textarea
            id="positive-prompt"
            value={positivePrompt}
            onChange={(e) => setPositivePrompt(e.target.value)}
            placeholder="Describe what you want to see..."
            disabled={isSubmitting}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            required
          />
        </div>

        {/* Negative Prompt */}
        <div>
          <label
            htmlFor="negative-prompt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Negative Prompt (Optional)
          </label>
          <textarea
            id="negative-prompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Describe what you don't want to see..."
            disabled={isSubmitting}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loadingWorkflows || !selectedWorkflowId || !positivePrompt.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {/* Debug Info */}
      {response && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Response:</h3>
          <pre className="text-xs overflow-auto text-gray-800 dark:text-gray-200">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
