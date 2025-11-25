/**
 * Generation Queue System
 * 
 * Handles parallel execution of multiple workflow generation jobs.
 * For now, uses mock generation to simulate image creation.
 */

import { GenerationJob, FunnelImage } from '../types/funnel';
import { funnelStorage } from './funnelStorage';

export interface GenerationProgress {
  jobId: string;
  workflowId: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep?: string;
}

type ProgressCallback = (progress: GenerationProgress) => void;

export class GenerationQueue {
  private jobs: Map<string, GenerationJob> = new Map();
  private progressCallbacks: Map<string, ProgressCallback[]> = new Map();

  /**
   * Generate a mock image filename
   */
  private generateMockFilename(workflowId: string, seed: number): string {
    const timestamp = Date.now();
    return `mock_funnel_${workflowId}_${seed}_${timestamp}.png`;
  }

  /**
   * Simulate image generation with progress updates
   */
  private async simulateGeneration(
    job: GenerationJob,
    onProgress: (progress: number) => void
  ): Promise<FunnelImage[]> {
    const steps = ['Loading model', 'Processing prompt', 'Sampling', 'Decoding', 'Saving'];
    const imagesPerJob = 1; // Generate 1 image per job for now

    for (let i = 0; i < steps.length; i++) {
      const progress = ((i + 1) / steps.length) * 100;
      onProgress(progress);

      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    }

    // Generate mock images
    const images: FunnelImage[] = [];
    for (let i = 0; i < imagesPerJob; i++) {
      const seed = job.parameters.seed || Math.floor(Math.random() * 1000000);
      const image: FunnelImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stepId: job.stepId,
        funnelId: job.funnelId,
        filename: this.generateMockFilename(job.workflowId, seed),
        type: 'output',
        subfolder: 'funnel',
        workflowId: job.workflowId,
        seed,
        parameters: job.parameters,
        prompt: job.prompt,
        negativePrompt: job.negativePrompt,
        selected: false,
        generatedAt: new Date().toISOString(),
        jobId: job.id,
      };
      images.push(image);
    }

    return images;
  }

  /**
   * Execute a single generation job
   */
  private async executeJob(job: GenerationJob): Promise<FunnelImage[]> {
    // Update job status
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    await funnelStorage.saveJob(job);

    try {
      // Simulate generation with progress updates
      const images = await this.simulateGeneration(job, (progress) => {
        job.progress = progress;

        // Notify progress callbacks
        const callbacks = this.progressCallbacks.get(job.id) || [];
        callbacks.forEach(cb => cb({
          jobId: job.id,
          workflowId: job.workflowId,
          progress,
          status: 'running',
          currentStep: `Generating with ${job.workflowId}`,
        }));
      });

      // Save generated images
      await funnelStorage.saveImages(images);

      // Update job status
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.resultImageIds = images.map(img => img.id);
      await funnelStorage.saveJob(job);

      // Notify completion
      const callbacks = this.progressCallbacks.get(job.id) || [];
      callbacks.forEach(cb => cb({
        jobId: job.id,
        workflowId: job.workflowId,
        progress: 100,
        status: 'completed',
      }));

      return images;
    } catch (error) {
      // Update job with error
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
      await funnelStorage.saveJob(job);

      // Notify failure
      const callbacks = this.progressCallbacks.get(job.id) || [];
      callbacks.forEach(cb => cb({
        jobId: job.id,
        workflowId: job.workflowId,
        progress: job.progress || 0,
        status: 'failed',
      }));

      throw error;
    }
  }

  /**
   * Execute multiple workflows in parallel
   */
  async executeParallel(
    funnelId: string,
    stepId: string,
    workflows: string[],
    prompt: string,
    negativePrompt: string | undefined,
    params: Record<string, unknown>
  ): Promise<{ jobs: GenerationJob[]; images: FunnelImage[] }> {
    const jobs: GenerationJob[] = [];

    // Create jobs for each workflow
    for (const workflowId of workflows) {
      const job: GenerationJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stepId,
        funnelId,
        workflowId,
        prompt,
        negativePrompt,
        parameters: {
          ...params,
          seed: params.seed || Math.floor(Math.random() * 1000000),
        },
        status: 'pending',
        progress: 0,
      };

      jobs.push(job);
      this.jobs.set(job.id, job);
      await funnelStorage.saveJob(job);
    }

    // Execute all jobs in parallel
    const results = await Promise.allSettled(
      jobs.map(job => this.executeJob(job))
    );

    // Collect all successfully generated images
    const allImages: FunnelImage[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allImages.push(...result.value);
      } else {
        console.error(`Job ${jobs[index].id} failed:`, result.reason);
      }
    });

    return { jobs, images: allImages };
  }

  /**
   * Execute refinements for selected images
   */
  async executeRefinements(
    funnelId: string,
    stepId: string,
    refinements: Array<{
      parentImageId: string;
      workflowId: string;
      prompt: string;
      negativePrompt?: string;
      parameters: Record<string, unknown>;
    }>
  ): Promise<{ jobs: GenerationJob[]; images: FunnelImage[] }> {
    const jobs: GenerationJob[] = [];

    // Create jobs for each refinement
    for (const refinement of refinements) {
      const job: GenerationJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stepId,
        funnelId,
        workflowId: refinement.workflowId,
        prompt: refinement.prompt,
        negativePrompt: refinement.negativePrompt,
        parameters: {
          ...refinement.parameters,
          parentImageId: refinement.parentImageId,
        },
        status: 'pending',
        progress: 0,
      };

      jobs.push(job);
      this.jobs.set(job.id, job);
      await funnelStorage.saveJob(job);
    }

    // Execute all jobs in parallel
    const results = await Promise.allSettled(
      jobs.map(job => this.executeJob(job))
    );

    // Collect all successfully generated images
    const allImages: FunnelImage[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const images = result.value;
        // Set parent image ID
        images.forEach(img => {
          img.parentImageId = refinements[index].parentImageId;
        });
        allImages.push(...images);
      } else {
        console.error(`Job ${jobs[index].id} failed:`, result.reason);
      }
    });

    return { jobs, images: allImages };
  }

  /**
   * Register a progress callback for a job
   */
  onProgress(jobId: string, callback: ProgressCallback): void {
    const callbacks = this.progressCallbacks.get(jobId) || [];
    callbacks.push(callback);
    this.progressCallbacks.set(jobId, callbacks);
  }

  /**
   * Remove progress callbacks for a job
   */
  removeProgressCallbacks(jobId: string): void {
    this.progressCallbacks.delete(jobId);
  }

  /**
   * Get job status
   */
  getJob(jobId: string): GenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs for a step
   */
  async getStepJobs(funnelId: string, stepId: string): Promise<GenerationJob[]> {
    return await funnelStorage.loadJobs(funnelId, stepId);
  }
}

// Singleton instance
export const generationQueue = new GenerationQueue();
