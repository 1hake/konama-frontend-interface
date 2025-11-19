/**
 * ImageRefinementPanel Component
 * 
 * Panel for editing parameters of selected images before creating next step
 */

'use client';

import { useState, useEffect } from 'react';
import { FunnelImage, FunnelRefinement } from '@/types/funnel';

interface ImageRefinementPanelProps {
  selectedImages: FunnelImage[];
  workflows: Array<{ id: string; name?: string }>;
  onRefinementsChange: (refinements: FunnelRefinement[]) => void;
}

export function ImageRefinementPanel({
  selectedImages,
  workflows,
  onRefinementsChange,
}: ImageRefinementPanelProps) {
  const [refinements, setRefinements] = useState<Map<string, FunnelRefinement>>(new Map());
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [globalNegativePrompt, setGlobalNegativePrompt] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);

  useEffect(() => {
    // Notify parent of changes
    onRefinementsChange(Array.from(refinements.values()));
  }, [refinements, onRefinementsChange]);

  const updateRefinement = (imageId: string, updates: Partial<FunnelRefinement>) => {
    setRefinements((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(imageId) || { imageId };
      newMap.set(imageId, { ...existing, ...updates });
      return newMap;
    });
  };

  const applyGlobalPrompts = () => {
    selectedImages.forEach((image) => {
      updateRefinement(image.id, {
        prompt: globalPrompt || undefined,
        negativePrompt: globalNegativePrompt || undefined,
      });
    });
  };

  if (selectedImages.length === 0) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-8 text-center">
        <p className="text-white/60">Select images to refine their parameters</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">
          Refine Parameters
        </h3>
        <span className="text-sm text-white/60">
          {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Global Prompts */}
      <div className="space-y-4 pb-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white/80">Apply to All Selected</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            <span className="text-sm text-white/60">Batch edit</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-white/60">Prompt Override</label>
            <button
              onClick={() => {
                // TODO: Integrate with prompt enhancer
                console.log('Enhance prompt:', globalPrompt);
              }}
              disabled={!globalPrompt}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:text-white/30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Enhance
            </button>
          </div>
          <textarea
            value={globalPrompt}
            onChange={(e) => setGlobalPrompt(e.target.value)}
            placeholder="Leave empty to keep original prompts..."
            rows={3}
            className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Negative Prompt Override</label>
          <textarea
            value={globalNegativePrompt}
            onChange={(e) => setGlobalNegativePrompt(e.target.value)}
            placeholder="Leave empty to keep original..."
            rows={2}
            className="w-full glass-light border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
          />
        </div>

        {applyToAll && (globalPrompt || globalNegativePrompt) && (
          <button
            onClick={applyGlobalPrompts}
            className="w-full glass-light border border-purple-500/30 text-purple-400 font-medium py-2 rounded-xl hover:bg-purple-500/10 transition-colors"
          >
            Apply to All {selectedImages.length} Images
          </button>
        )}
      </div>

      {/* Per-Image Refinements */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <h4 className="text-sm font-medium text-white/80">Individual Refinements</h4>

        {selectedImages.map((image) => {
          const refinement = refinements.get(image.id);

          return (
            <div
              key={image.id}
              className="glass-light rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                  <div className="w-full h-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">
                    IMG
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate">
                    {image.prompt}
                  </div>
                  <div className="text-xs text-white/40">
                    {image.workflowId} • Seed: {image.seed}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1">Workflow</label>
                <select
                  value={refinement?.workflowId || image.workflowId}
                  onChange={(e) =>
                    updateRefinement(image.id, { workflowId: e.target.value })
                  }
                  className="w-full glass-light border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name || workflow.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1">Seed</label>
                <input
                  type="number"
                  value={refinement?.seed ?? image.seed}
                  onChange={(e) =>
                    updateRefinement(image.id, {
                      seed: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full glass-light border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {refinement && (refinement.prompt || refinement.negativePrompt) && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Modified
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/40">
          💡 Refinements will be applied when creating the next step
        </p>
      </div>
    </div>
  );
}
