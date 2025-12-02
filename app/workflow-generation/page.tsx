'use client';

import { WorkflowPromptForm } from '@/components';
import { ProtectedRoute } from '@/components';

export default function WorkflowGenerationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Workflow-Based Image Generation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select a workflow and provide prompts to generate images
            </p>
          </div>

          <WorkflowPromptForm />

          {/* Instructions */}
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
              How to use:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>Select a workflow from the dropdown (workflows are loaded automatically)</li>
              <li>Enter your positive prompt describing what you want to see</li>
              <li>Optionally, enter a negative prompt for what you don&apos;t want</li>
              <li>Choose generation mode (Slow for higher quality, Fast for speed)</li>
              <li>Click &quot;Generate Image&quot; to submit your workflow</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> The system automatically finds CLIPTextEncode nodes in the
                workflow and injects your prompts. Check the browser console for detailed logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
