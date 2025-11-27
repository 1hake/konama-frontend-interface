/**
 * useFunnel Hook
 * 
 * Manages funnel state and provides methods for funnel operations
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Funnel,
  FunnelStep,
  FunnelImage,
  FunnelState,
  FunnelConfig,
  FunnelRefinement,
  GenerationJob,
} from '../types/funnel';

export interface UseFunnelReturn {
  // State
  funnel: Funnel | null;
  currentStep: FunnelStep | null;
  steps: FunnelStep[];
  images: FunnelImage[];
  selectedImages: FunnelImage[];
  jobs: GenerationJob[];
  loading: boolean;
  error: string | null;
  isGenerating: boolean;

  // Actions
  createFunnel: (config: FunnelConfig, name: string, description?: string) => Promise<void>;
  loadFunnel: (funnelId: string) => Promise<void>;
  selectImages: (imageIds: string[]) => Promise<void>;
  createNextStep: (refinements?: FunnelRefinement[], promptFields?: any, technicalParameters?: any) => Promise<void>;
  deleteFunnel: (funnelId: string) => Promise<void>;
  refreshFunnel: () => Promise<void>;
}

export function useFunnel(funnelId?: string): UseFunnelReturn {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [currentStep, setCurrentStep] = useState<FunnelStep | null>(null);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [images, setImages] = useState<FunnelImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<FunnelImage[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Load funnel data from API
   */
  const loadFunnel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/funnel/${id}`);

      const data: FunnelState = response.data;
      setFunnel(data.funnel);
      setCurrentStep(data.currentStep);
      setSteps(data.steps);
      setImages(data.images);
      setSelectedImages(data.selectedImages);
      setJobs(data.jobs);

      // Check if any jobs are still running
      const hasRunningJobs = data.jobs.some(
        job => job.status === 'pending' || job.status === 'running'
      );
      setIsGenerating(hasRunningJobs);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : (err instanceof Error ? err.message : 'Failed to load funnel');
      setError(errorMessage);
      console.error('Error loading funnel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new funnel
   */
  const createFunnel = useCallback(
    async (config: FunnelConfig, name: string, description?: string) => {
      setLoading(true);
      setError(null);
      setIsGenerating(true);

      try {
        const response = await axios.post('/api/funnel/create', {
          name,
          description,
          config
        });

        const data = response.data;
        setFunnel(data.funnel);
        setCurrentStep(data.step);
        setSteps([data.step]);
        setImages(data.images);
        setSelectedImages([]);
        setJobs(data.jobs);

        // Wait for generation to complete
        await loadFunnel(data.funnel.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create funnel');
        console.error('Error creating funnel:', err);
        throw err;
      } finally {
        setLoading(false);
        setIsGenerating(false);
      }
    },
    [loadFunnel]
  );

  /**
   * Select images in the current step
   */
  const selectImages = useCallback(
    async (imageIds: string[]) => {
      if (!funnel || !currentStep) {
        throw new Error('No funnel or current step');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `/api/funnel/${funnel.id}/step/${currentStep.id}/select`,
          { imageIds }
        );

        const data = response.data;
        setCurrentStep(data.step);
        setSelectedImages(data.selectedImages);

        // Update images selection state
        setImages(prevImages =>
          prevImages.map(img => ({
            ...img,
            selected: imageIds.includes(img.id),
          }))
        );

        // Refresh funnel to get updated state
        await loadFunnel(funnel.id);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : (err instanceof Error ? err.message : 'Failed to select images');
        setError(errorMessage);
        console.error('Error selecting images:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [funnel, currentStep, loadFunnel]
  );

/**
 * Create next step with refinements
 */
const createNextStep = useCallback(
  async (refinements?: FunnelRefinement[], promptFields?: any, technicalParameters?: any) => {
    if (!funnel || !currentStep) {
      throw new Error('No funnel or current step');
    }

    if (selectedImages.length === 0) {
      throw new Error('No images selected');
    }

    setLoading(true);
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/funnel/${funnel.id}/step/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedImageIds: selectedImages.map(img => img.id),
          refinements,
          promptFields,
          technicalParameters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create next step');
      }

      const data = await response.json();
      setFunnel(data.funnel);
      setCurrentStep(data.step);
      setSteps(prevSteps => [...prevSteps, data.step]);
      setImages(prevImages => [...prevImages, ...data.images]);
      setSelectedImages([]);
      setJobs(prevJobs => [...prevJobs, ...data.jobs]);

      // Wait for generation to complete
      await loadFunnel(data.funnel.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create next step');
      console.error('Error creating next step:', err);
      throw err;
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  },
  [funnel, currentStep, selectedImages, loadFunnel]
);

/**
 * Delete a funnel
 */
const deleteFunnel = useCallback(async (id: string) => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`/api/funnel/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete funnel');
    }

    // Clear state if we deleted the current funnel
    if (funnel?.id === id) {
      setFunnel(null);
      setCurrentStep(null);
      setSteps([]);
      setImages([]);
      setSelectedImages([]);
      setJobs([]);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to delete funnel');
    console.error('Error deleting funnel:', err);
    throw err;
  } finally {
    setLoading(false);
  }
}, [funnel]);

/**
 * Refresh current funnel
 */
const refreshFunnel = useCallback(async () => {
  if (funnel) {
    await loadFunnel(funnel.id);
  }
}, [funnel, loadFunnel]);

// Auto-load funnel if funnelId is provided
useEffect(() => {
  if (funnelId) {
    loadFunnel(funnelId);
  }
}, [funnelId, loadFunnel]);

return {
  funnel,
  currentStep,
  steps,
  images,
  selectedImages,
  jobs,
  loading,
  error,
  isGenerating,
  createFunnel,
  loadFunnel,
  selectImages,
  createNextStep,
  deleteFunnel,
  refreshFunnel,
};
}
