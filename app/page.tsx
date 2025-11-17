'use client';

import { useState, useEffect, useCallback } from 'react';
import { useImageGeneration } from '../hooks';
import { useWorkflows } from '../hooks/useWorkflows';
import { ImageGenerationForm, GeneratedImagesDisplay, GenerationProgress } from '../components';
import { WorkflowDebugger } from '../components/WorkflowDebugger';
import { GeneratedImage } from '../types';
import { config } from '../lib/config';

export default function Home() {
  const {
    isGenerating,
    progress,
    generatedImages,
    error,
    generateImage,
    resetGeneration,
  } = useImageGeneration();

  // Use the workflows hook instead of inline management
  const {
    workflows: availableWorkflows,
    loading: workflowsLoading,
    error: workflowsError,
    refreshWorkflows
  } = useWorkflows();

  console.log('Page render - Workflows state:', {
    availableWorkflows: availableWorkflows.length,
    workflowsLoading,
    workflowsError,
    workflows: availableWorkflows
  });

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Auto-select the first workflow when workflows are loaded
  useEffect(() => {
    if (availableWorkflows.length > 0 && !selectedWorkflow) {
      setSelectedWorkflow(availableWorkflows[0].id);
      console.log('Auto-selected first workflow:', availableWorkflows[0].id);
    }
  }, [availableWorkflows, selectedWorkflow]);

  // Helper function to generate image URLs
  const getImageUrl = (image: GeneratedImage) => {
    // Handle mock images
    if (image.filename.startsWith('mock_')) {
      // Return a placeholder image URL for mock mode
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Crect fill='%23a855f7' width='512' height='512'/%3E%3Ctext x='50%25' y='40%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='24' fill='%23ffffff'%3E🎭 Mock Image✨%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' fill='%23e9d5ff'%3EMock Generation Complete%3C/text%3E%3Ctext x='50%25' y='70%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23e9d5ff'%3ENo endpoints required%3C/text%3E%3C/svg%3E`;
    }

    const params = new URLSearchParams({
      filename: image.filename,
      type: image.type,
      subfolder: image.subfolder || ''
    });
    return `/api/view?${params.toString()}`;
  };

  // Wrapper function to include workflowId in generation
  const handleGenerateImage = async (prompt: string, negativePrompt?: string, options?: any) => {
    if (!selectedWorkflow) {
      console.error('No workflow selected');
      return;
    }

    await generateImage(prompt, negativePrompt, {
      ...options,
      workflowId: selectedWorkflow
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pb-[450px]">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <img 
              src="/images/fuzdi_white.png" 
              alt="Fuzdi" 
              className="h-12 md:h-16 lg:h-20 w-auto"
            />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
              studio
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Images */}
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Progress Display */}
          <GenerationProgress progress={progress} />

          {/* Image Display Area - Centered */}
          <div className="glass rounded-3xl shadow-2xl p-8 min-h-[500px] flex items-center justify-center border border-white/10">
            <GeneratedImagesDisplay
              images={generatedImages}
              getImageUrl={getImageUrl}
            />
          </div>

          {/* Reset Button */}
          {(generatedImages.length > 0 || error) && (
            <div className="flex justify-center">
              <button
                onClick={resetGeneration}
                className="glass-light hover:bg-white/15 text-white font-medium py-3.5 px-10 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 border border-white/20 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Nouvelle génération</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Panel */}
      <ImageGenerationForm
        onGenerate={handleGenerateImage}
        isGenerating={isGenerating}
        error={error}
        availableWorkflows={availableWorkflows}
        selectedWorkflow={selectedWorkflow}
        onWorkflowChange={setSelectedWorkflow}
        onRefreshWorkflows={refreshWorkflows}
      />
    </div>
  );
}
