'use client';

import { useState, useEffect } from 'react';
import { useImageGeneration } from '../hooks';
import { useWorkflows } from '../hooks/useWorkflows';
import { useFunnel } from '../hooks/useFunnel';
import { ImageGenerationForm, GeneratedImagesDisplay } from '../components';

import { FunnelTimeline, FunnelStepViewer } from '../components/Funnel';
import { GeneratedImage, FunnelRefinement } from '../types';


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

  // Funnel mode state and hooks
  const [isFunnelMode, setIsFunnelMode] = useState(false);
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(null);
  const {
    funnel,
    currentStep,
    steps,
    images: funnelImages,
    selectedImages: funnelSelectedImages,
    isGenerating: isFunnelGenerating,
    createFunnel,
    loadFunnel,
    selectImages: selectFunnelImages,
    createNextStep,
    error: funnelError,
  } = useFunnel(activeFunnelId || undefined);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [viewStepIndex, setViewStepIndex] = useState(0);

  // Unified refinement state for cleaner state management
  const [refinementState, setRefinementState] = useState<{
    promptFields: any | null;
    technicalFields: any | null;
    imageRefinements: FunnelRefinement[];
  }>({
    promptFields: null,
    technicalFields: null,
    imageRefinements: [],
  });

  // Auto-select the first workflow when workflows are loaded
  useEffect(() => {
    if (availableWorkflows.length > 0 && !selectedWorkflow && selectedWorkflows.length === 0) {
      setSelectedWorkflow(availableWorkflows[0].id);
      setSelectedWorkflows([availableWorkflows[0].id]);
      console.log('Auto-selected first workflow:', availableWorkflows[0].id);
    }
  }, [availableWorkflows, selectedWorkflow]);

  // Auto-switch to funnel mode when 2+ workflows selected
  useEffect(() => {
    const shouldBeFunnelMode = selectedWorkflows.length >= 2;
    if (shouldBeFunnelMode !== isFunnelMode) {
      setIsFunnelMode(shouldBeFunnelMode);
      console.log(`Auto-switched to ${shouldBeFunnelMode ? 'funnel' : 'normal'} mode:`, selectedWorkflows.length, 'workflows');
    }
  }, [selectedWorkflows.length, isFunnelMode]);

  // Update view when funnel changes
  useEffect(() => {
    if (funnel) {
      setViewStepIndex(funnel.currentStepIndex);
    }
  }, [funnel?.currentStepIndex]);

  // Load step parameters when viewing a different step
  const handleStepClick = (stepIndex: number) => {
    setViewStepIndex(stepIndex);
    const step = steps[stepIndex];

    // Clear selections when changing steps
    setSelectedImageIds([]);

    // Load step data or clear if no step exists
    if (step) {
      setRefinementState({
        promptFields: step.promptFields || null,
        technicalFields: step.technicalParameters || null,
        imageRefinements: [],
      });
    } else {
      setRefinementState({
        promptFields: null,
        technicalFields: null,
        imageRefinements: [],
      });
    }
  };

  // Load selected images from funnel
  useEffect(() => {
    if (funnelSelectedImages.length > 0) {
      setSelectedImageIds(funnelSelectedImages.map(img => img.id));
    }
  }, [funnelSelectedImages]);

  // Handle image selection changes and sync with funnel
  const handleImageSelectionChange = async (imageIds: string[]) => {
    setSelectedImageIds(imageIds);
    // Sync with funnel hook
    if (funnel && currentStep && imageIds.length > 0) {
      try {
        await selectFunnelImages(imageIds);
      } catch (err) {
        console.error('Error selecting images in funnel:', err);
      }
    }
  };

  // Helper function to generate image URLs
  const getImageUrl = (image: GeneratedImage) => {
    // Handle mock images
    if (image.filename.startsWith('mock_')) {
      // Return a random placeholder image from picsum.photos
      const seed = Math.abs(image.filename.split('_')[1]?.charCodeAt(0) || Date.now());
      return `https://picsum.photos/seed/${seed}/1024/1024`;
    }

    const params = new URLSearchParams({
      filename: image.filename,
      type: image.type,
      subfolder: image.subfolder || ''
    });
    return `/api/view?${params.toString()}`;
  };

  // Wrapper function to include workflowId in generation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGenerateImage = async (prompt: string, negativePrompt?: string, options?: any) => {
    if (isFunnelMode) {
      // Funnel mode: create new funnel or add step
      if (!funnel) {
        // Create new funnel
        if (selectedWorkflows.length === 0) {
          console.error('No workflows selected for funnel');
          return;
        }
        try {
          await createFunnel(
            {
              selectedWorkflows,
              basePrompt: prompt,
              baseNegativePrompt: negativePrompt,
              baseParameters: options || {},
            },
            `Funnel ${new Date().toLocaleString()}`,
            undefined
          );
        } catch (err) {
          console.error('Error creating funnel:', err);
        }
      } else {
        // Add step to existing funnel
        if (selectedImageIds.length === 0) {
          console.error('No images selected for next step');
          return;
        }
        try {
          // Use unified refinement state - prioritize imageRefinements if set
          const stepRefinements = refinementState.imageRefinements.length > 0
            ? refinementState.imageRefinements
            : selectedImageIds.map(imageId => ({
              imageId,
              prompt,
              negativePrompt,
              parameters: options,
            }));

          await createNextStep(
            stepRefinements,
            refinementState.promptFields || options?.promptFields,
            refinementState.technicalFields || options?.technicalParameters
          );

          // Reset refinement state after step creation
          setSelectedImageIds([]);
          setRefinementState({
            promptFields: null,
            technicalFields: null,
            imageRefinements: [],
          });
        } catch (err) {
          console.error('Error creating next step:', err);
        }
      }
    } else {
      // Normal mode: single workflow generation
      if (!selectedWorkflow) {
        console.error('No workflow selected');
        return;
      }
      await generateImage(prompt, negativePrompt, {
        ...options,
        workflowId: selectedWorkflow
      });
    }
  };

  // Get images for current funnel step
  const currentStepImages = funnelImages.filter(
    img => img.stepId === steps[viewStepIndex]?.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pb-[400px]">
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
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* Mode Indicator */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isFunnelMode
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              {isFunnelMode ? `Funnel (${selectedWorkflows.length})` : 'Single'}
            </div>
            {isFunnelMode && funnel && (
              <div className="bg-white/5 border border-white/10 text-white/60 px-3 py-1.5 rounded-lg text-xs">
                {funnel.name} • Step {funnel.currentStepIndex + 1}/{steps.length}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {isFunnelMode ? (
            // FUNNEL MODE
            <>
              {/* Timeline */}
              {funnel && steps.length > 0 && (
                <FunnelTimeline
                  steps={steps}
                  currentStepIndex={viewStepIndex}
                  onStepClick={handleStepClick}
                />
              )}

              {/* Two Column Layout for Funnel */}
              {funnel ? (
                <div className="space-y-4">
                  {/* Image Viewer - Full width */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-light text-white">
                        Step {viewStepIndex + 1} Images
                      </h2>
                      {isFunnelGenerating && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm">Generating...</span>
                        </div>
                      )}
                    </div>

                    <div className="glass rounded-2xl shadow-2xl p-6 border border-white/10 min-h-[500px]">
                      <FunnelStepViewer
                        images={currentStepImages}
                        selectedImageIds={selectedImageIds}
                        onSelectionChange={handleImageSelectionChange}
                        getImageUrl={(img) => {
                          if (img.filename.startsWith('mock_')) {
                            // Use seed from image to get consistent placeholder
                            const seed = img.seed || Math.abs(img.filename.split('_')[1]?.charCodeAt(0) || Date.now());
                            return `https://picsum.photos/seed/${seed}/1024/1024`;
                          }
                          const params = new URLSearchParams({ filename: img.filename, type: img.type, subfolder: img.subfolder || '' });
                          return `/api/view?${params.toString()}`;
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // No active funnel
                <div className="glass rounded-3xl shadow-2xl p-12 text-center border border-white/10 min-h-[500px] flex items-center justify-center">
                  <div className="max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-light text-white mb-3">Start a New Funnel</h3>
                    <p className="text-white/60 mb-6">
                      Use the prompt builder below to create your first funnel.
                      Select multiple workflows to generate diverse results.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // NORMAL MODE
            <>
              {/* Image Display Area with Integrated Progress - Centered */}
              <div className="glass rounded-3xl shadow-2xl p-8 min-h-[500px] flex items-center justify-center border border-white/10">
                <GeneratedImagesDisplay
                  images={generatedImages}
                  getImageUrl={getImageUrl}
                  progress={progress}
                  isGenerating={isGenerating}
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
            </>
          )}
        </div>
      </div>

      {/* Floating Bottom Panel */}
      <ImageGenerationForm
        onGenerate={handleGenerateImage}
        isGenerating={isFunnelMode ? isFunnelGenerating : isGenerating}
        error={isFunnelMode ? funnelError : error}
        availableWorkflows={availableWorkflows}
        selectedWorkflow={selectedWorkflow}
        onWorkflowChange={setSelectedWorkflow}
        onRefreshWorkflows={refreshWorkflows}
        isFunnelMode={isFunnelMode}
        selectedWorkflows={selectedWorkflows}
        onSelectedWorkflowsChange={setSelectedWorkflows}
        viewStepIndex={viewStepIndex}
        currentStepIndex={funnel?.currentStepIndex}
        editingPromptFields={refinementState.promptFields}
        editingTechnicalFields={refinementState.technicalFields}
        onEditingFieldsChange={(promptFields, technicalFields) => {
          setRefinementState(prev => ({
            ...prev,
            promptFields,
            technicalFields,
          }));
        }}
      />
    </div>
  );
}
