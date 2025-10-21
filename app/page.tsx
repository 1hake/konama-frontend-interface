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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
            DIF<span className="text-purple-400">FUSION</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-300">
            Créez des images uniques avec l&apos;intelligence artificielle
          </p>
        </div>
      </header>

      {/* Main Layout - Two Column */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left Column - Generated Image Display */}
          <div className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Progress Display */}
              <GenerationProgress progress={progress} />

              {/* Image Display Area */}
              <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
                <GeneratedImagesDisplay
                  images={generatedImages}
                  getImageUrl={getImageUrl}
                />
              </div>

              {/* Reset Button */}
              {(generatedImages.length > 0 || error) && (
                <div className="bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6">
                  <button
                    onClick={resetGeneration}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
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

          {/* Right Column - Form */}
          <div className="order-1 lg:order-2 min-h-[600px] lg:min-h-[800px] flex flex-col space-y-4">
            {/* Debug Component - Temporary */}
            {/* <WorkflowDebugger /> */}

            <ImageGenerationForm
              onGenerate={handleGenerateImage}
              isGenerating={isGenerating}
              error={error || workflowsError}
              availableWorkflows={availableWorkflows}
              selectedWorkflow={selectedWorkflow}
              onWorkflowChange={setSelectedWorkflow}
              onRefreshWorkflows={refreshWorkflows}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
