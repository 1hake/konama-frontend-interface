/**
 * FunnelCreationModal Component
 * 
 * Modal for configuring and creating new funnels
 */

'use client';

import { useState } from 'react';
import { FunnelConfig } from '@/types/funnel';
import { FunnelWorkflowSelector, Workflow } from './FunnelWorkflowSelector';

interface FunnelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: FunnelConfig, name: string, description?: string) => Promise<void>;
  workflows: Workflow[];
}

export function FunnelCreationModal({
  isOpen,
  onClose,
  onCreate,
  workflows,
}: FunnelCreationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [basePrompt, setBasePrompt] = useState('');
  const [baseNegativePrompt, setBaseNegativePrompt] = useState('');
  const [imagesPerWorkflow, setImagesPerWorkflow] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a funnel name');
      return;
    }

    if (selectedWorkflows.length === 0) {
      setError('Please select at least one workflow');
      return;
    }

    if (!basePrompt.trim()) {
      setError('Please enter a base prompt');
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const config: FunnelConfig = {
        selectedWorkflows,
        basePrompt: basePrompt.trim(),
        baseNegativePrompt: baseNegativePrompt.trim() || undefined,
        baseParameters: {},
        imagesPerWorkflow,
      };

      await onCreate(config, name.trim(), description.trim() || undefined);

      // Reset form
      setName('');
      setDescription('');
      setSelectedWorkflows([]);
      setBasePrompt('');
      setBaseNegativePrompt('');
      setImagesPerWorkflow(1);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create funnel');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass border border-white/20 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-light text-white">Create New Funnel</h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="glass-light border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Funnel Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Photography Variations"
              disabled={isCreating}
              className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this funnel..."
              disabled={isCreating}
              rows={2}
              className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Workflow Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Select Workflows *
            </label>
            <FunnelWorkflowSelector
              workflows={workflows}
              selectedWorkflows={selectedWorkflows}
              onChange={setSelectedWorkflows}
              disabled={isCreating}
            />
            <p className="mt-2 text-sm text-white/40">
              Selected workflows will run in parallel to generate diverse results
            </p>
          </div>

          {/* Base Prompt */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Base Prompt *
            </label>
            <textarea
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="Enter your base prompt..."
              disabled={isCreating}
              rows={4}
              className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 resize-none"
              required
            />
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Negative Prompt (Optional)
            </label>
            <textarea
              value={baseNegativePrompt}
              onChange={(e) => setBaseNegativePrompt(e.target.value)}
              placeholder="What to avoid in the images..."
              disabled={isCreating}
              rows={2}
              className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Images per Workflow */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Images per Workflow
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={imagesPerWorkflow}
              onChange={(e) => setImagesPerWorkflow(parseInt(e.target.value) || 1)}
              disabled={isCreating}
              className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
            />
            <p className="mt-2 text-sm text-white/40">
              Total: {selectedWorkflows.length * imagesPerWorkflow} images will be generated
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 glass-light border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating Funnel...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Create & Generate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
