/**
 * Funnel Editor Page
 * 
 * Main interface for working with a funnel
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFunnel } from '@/hooks/useFunnel';
import { useWorkflows } from '@/hooks/useWorkflows';
import { FunnelTimeline } from '@/components/Funnel/FunnelTimeline';
import { FunnelStepViewer } from '@/components/Funnel/FunnelStepViewer';
import { ImageRefinementPanel } from '@/components/Funnel/ImageRefinementPanel';
import { FunnelImage, FunnelRefinement } from '@/types/funnel';

export default function FunnelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params.id as string;

  const {
    funnel,
    steps,
    images: allImages,
    selectedImages: initialSelectedImages,
    loading,
    error,
    isGenerating,
    selectImages,
    createNextStep,
    deleteFunnel,
  } = useFunnel(funnelId);

  const { workflows } = useWorkflows();

  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [refinements, setRefinements] = useState<FunnelRefinement[]>([]);
  const [viewStepIndex, setViewStepIndex] = useState(0);

  // Get images for current viewed step
  const currentStepImages = allImages.filter(
    img => img.stepId === steps[viewStepIndex]?.id
  );

  const selectedImagesForRefinement = currentStepImages.filter(img =>
    selectedImageIds.includes(img.id)
  );

  // Update view when current step changes
  useEffect(() => {
    if (funnel) {
      setViewStepIndex(funnel.currentStepIndex);
    }
  }, [funnel]);

  // Load selected images from API
  useEffect(() => {
    if (initialSelectedImages.length > 0) {
      setSelectedImageIds(initialSelectedImages.map(img => img.id));
    }
  }, [initialSelectedImages]);

  const handleSelectImages = async () => {
    try {
      await selectImages(selectedImageIds);
    } catch (err) {
      console.error('Error selecting images:', err);
    }
  };

  const handleCreateNextStep = async () => {
    try {
      await createNextStep(refinements.length > 0 ? refinements : undefined);
      setSelectedImageIds([]);
      setRefinements([]);
    } catch (err) {
      console.error('Error creating next step:', err);
    }
  };

  const handleDeleteFunnel = async () => {
    if (confirm('Are you sure you want to delete this funnel? This action cannot be undone.')) {
      try {
        await deleteFunnel(funnelId);
        router.push('/funnels');
      } catch (err) {
        console.error('Error deleting funnel:', err);
      }
    }
  };

  const getImageUrl = (image: FunnelImage) => {
    if (image.filename.startsWith('mock_')) {
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect fill='%23a855f7' width='512' height='512'/%3E%3Ctext x='50%25' y='40%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20' fill='%23ffffff'%3E🎭 ${image.workflowId}%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='14' fill='%23e9d5ff'%3ESeed: ${image.seed}%3C/text%3E%3Ctext x='50%25' y='70%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='%23e9d5ff'%3EMock Image%3C/text%3E%3C/svg%3E`;
    }

    const params = new URLSearchParams({
      filename: image.filename,
      type: image.type,
      subfolder: image.subfolder || '',
    });
    return `/api/view?${params.toString()}`;
  };

  if (loading && !funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
          >
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
          <p className="text-white/60 mt-4">Loading funnel...</p>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="glass rounded-2xl border border-white/10 p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Funnel Not Found</h2>
          <p className="text-white/60 mb-6">{error || 'The funnel you are looking for does not exist.'}</p>
          <Link
            href="/funnels"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-2 px-6 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Back to Funnels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pb-12">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <Link
          href="/funnels"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Funnels
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">{funnel.name}</h1>
            {funnel.description && (
              <p className="text-white/60">{funnel.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-white/40">
                {funnel.config.selectedWorkflows.length} workflows
              </span>
              <span className="text-sm text-white/40">•</span>
              <span className="text-sm text-white/40">
                {steps.length} steps
              </span>
              <span className="text-sm text-white/40">•</span>
              <span className="text-sm text-white/40">
                {allImages.length} total images
              </span>
            </div>
          </div>

          <button
            onClick={handleDeleteFunnel}
            className="glass-light border border-red-500/20 text-red-400 font-medium py-2 px-4 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            Delete Funnel
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 space-y-6">
        {/* Timeline */}
        <FunnelTimeline
          steps={steps}
          currentStepIndex={viewStepIndex}
          onStepClick={setViewStepIndex}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Viewer - Takes 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-white">
                Step {viewStepIndex + 1} Images
              </h2>
              {isGenerating && (
                <div className="flex items-center gap-2 text-yellow-400">
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
                  <span className="text-sm">Generating...</span>
                </div>
              )}
            </div>

            <FunnelStepViewer
              images={currentStepImages}
              selectedImageIds={selectedImageIds}
              onSelectionChange={setSelectedImageIds}
              getImageUrl={getImageUrl}
            />

            {/* Action Buttons */}
            {selectedImageIds.length > 0 && viewStepIndex === funnel.currentStepIndex && (
              <div className="flex gap-3">
                <button
                  onClick={handleSelectImages}
                  className="flex-1 glass-light border border-purple-500/30 text-purple-400 font-medium py-3 px-6 rounded-xl hover:bg-purple-500/10 transition-colors"
                >
                  Confirm Selection ({selectedImageIds.length})
                </button>
                <button
                  onClick={handleCreateNextStep}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create Next Step
                </button>
              </div>
            )}
          </div>

          {/* Refinement Panel - Takes 1/3 */}
          <div className="lg:col-span-1">
            <ImageRefinementPanel
              selectedImages={selectedImagesForRefinement}
              workflows={workflows.map(w => ({ id: w.id, name: w.id }))}
              onRefinementsChange={setRefinements}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
