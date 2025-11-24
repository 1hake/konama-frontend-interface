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
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-12 text-center shadow-lg">
        <p className="text-white/40 font-medium">Select images to refine their parameters</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 space-y-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Refine Parameters
        </h3>
        <span className="text-sm text-white/50 font-medium">
          {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Global Prompts */}
      <div className="space-y-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white/70">Apply to All Selected</h4>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-5 h-5 rounded-md border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors font-medium">Batch edit</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-sm text-white/50 font-medium">Prompt Override</label>
            <button
              onClick={() => {
                // TODO: Integrate with prompt enhancer
                console.log('Enhance prompt:', globalPrompt);
              }}
              disabled={!globalPrompt}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:text-white/20 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all font-medium text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-2.5 font-medium">Negative Prompt Override</label>
          <textarea
            value={globalNegativePrompt}
            onChange={(e) => setGlobalNegativePrompt(e.target.value)}
            placeholder="Leave empty to keep original..."
            rows={2}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all font-medium text-sm"
          />
        </div>

        {applyToAll && (globalPrompt || globalNegativePrompt) && (
          <button
            onClick={applyGlobalPrompts}
            className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold py-3 rounded-xl hover:bg-blue-500/20 transition-all duration-200 shadow-lg shadow-blue-500/10"
          >
            Apply to All {selectedImages.length} Images
          </button>
        )}
      </div>

      {/* Per-Image Refinements */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <h4 className="text-sm font-semibold text-white/70">Individual Refinements</h4>

        {selectedImages.map((image) => {
          const refinement = refinements.get(image.id);

          return (
            <div
              key={image.id}
              className="bg-white/[0.03] rounded-xl p-4 space-y-3.5 border border-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
                  <div className="w-full h-full bg-blue-500/10 flex items-center justify-center text-xs text-blue-400/70 font-semibold">
                    IMG
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate font-medium">
                    {image.prompt}
                  </div>
                  <div className="text-xs text-white/40 font-mono mt-0.5">
                    {image.workflowId} • Seed: {image.seed}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Workflow</label>
                <select
                  value={refinement?.workflowId || image.workflowId}
                  onChange={(e) =>
                    updateRefinement(image.id, { workflowId: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                >
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name || workflow.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Seed</label>
                <input
                  type="number"
                  value={refinement?.seed ?? image.seed}
                  onChange={(e) =>
                    updateRefinement(image.id, {
                      seed: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                />
              </div>

              {refinement && (refinement.prompt || refinement.negativePrompt) && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="text-xs text-green-400/80 flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Modified
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/[0.08]">
        <p className="text-xs text-white/30 font-medium">
          💡 Refinements will be applied when creating the next step
        </p>
      </div>
    </div>
  );
}
