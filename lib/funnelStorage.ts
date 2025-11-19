/**
 * Funnel Storage Layer
 * 
 * Handles filesystem-based JSON persistence for funnels, steps, and images.
 * Storage structure:
 * /data/funnels/
 *   [funnelId]/
 *     funnel.json
 *     steps/
 *       [stepId].json
 *     images/
 *       [imageId].json
 */

import fs from 'fs';
import path from 'path';
import { Funnel, FunnelStep, FunnelImage, GenerationJob } from '../types/funnel';

const DATA_DIR = process.env.FUNNEL_DATA_DIR || path.join(process.cwd(), 'data', 'funnels');

export class FunnelStorage {
  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getFunnelDir(funnelId: string): string {
    return path.join(DATA_DIR, funnelId);
  }

  private getFunnelPath(funnelId: string): string {
    return path.join(this.getFunnelDir(funnelId), 'funnel.json');
  }

  private getStepsDir(funnelId: string): string {
    return path.join(this.getFunnelDir(funnelId), 'steps');
  }

  private getStepPath(funnelId: string, stepId: string): string {
    return path.join(this.getStepsDir(funnelId), `${stepId}.json`);
  }

  private getImagesDir(funnelId: string): string {
    return path.join(this.getFunnelDir(funnelId), 'images');
  }

  private getImagePath(funnelId: string, imageId: string): string {
    return path.join(this.getImagesDir(funnelId), `${imageId}.json`);
  }

  private getJobsDir(funnelId: string): string {
    return path.join(this.getFunnelDir(funnelId), 'jobs');
  }

  private getJobPath(funnelId: string, jobId: string): string {
    return path.join(this.getJobsDir(funnelId), `${jobId}.json`);
  }

  /**
   * Save funnel metadata
   */
  async saveFunnel(funnel: Funnel): Promise<void> {
    const funnelDir = this.getFunnelDir(funnel.id);
    this.ensureDir(funnelDir);

    const funnelPath = this.getFunnelPath(funnel.id);
    fs.writeFileSync(funnelPath, JSON.stringify(funnel, null, 2), 'utf-8');
  }

  /**
   * Load funnel metadata
   */
  async loadFunnel(funnelId: string): Promise<Funnel | null> {
    const funnelPath = this.getFunnelPath(funnelId);

    if (!fs.existsSync(funnelPath)) {
      return null;
    }

    const data = fs.readFileSync(funnelPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * List all funnels
   */
  async listFunnels(): Promise<Funnel[]> {
    this.ensureDir(DATA_DIR);

    const funnelDirs = fs.readdirSync(DATA_DIR);
    const funnels: Funnel[] = [];

    for (const funnelId of funnelDirs) {
      const funnel = await this.loadFunnel(funnelId);
      if (funnel) {
        funnels.push(funnel);
      }
    }

    // Sort by updatedAt descending
    return funnels.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Delete a funnel and all its data
   */
  async deleteFunnel(funnelId: string): Promise<void> {
    const funnelDir = this.getFunnelDir(funnelId);
    if (fs.existsSync(funnelDir)) {
      fs.rmSync(funnelDir, { recursive: true, force: true });
    }
  }

  /**
   * Save step metadata
   */
  async saveStep(step: FunnelStep): Promise<void> {
    const stepsDir = this.getStepsDir(step.funnelId);
    this.ensureDir(stepsDir);

    const stepPath = this.getStepPath(step.funnelId, step.id);
    fs.writeFileSync(stepPath, JSON.stringify(step, null, 2), 'utf-8');
  }

  /**
   * Load a specific step
   */
  async loadStep(funnelId: string, stepId: string): Promise<FunnelStep | null> {
    const stepPath = this.getStepPath(funnelId, stepId);

    if (!fs.existsSync(stepPath)) {
      return null;
    }

    const data = fs.readFileSync(stepPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Load all steps for a funnel
   */
  async loadSteps(funnelId: string): Promise<FunnelStep[]> {
    const stepsDir = this.getStepsDir(funnelId);

    if (!fs.existsSync(stepsDir)) {
      return [];
    }

    const stepFiles = fs.readdirSync(stepsDir);
    const steps: FunnelStep[] = [];

    for (const file of stepFiles) {
      if (file.endsWith('.json')) {
        const stepId = file.replace('.json', '');
        const step = await this.loadStep(funnelId, stepId);
        if (step) {
          steps.push(step);
        }
      }
    }

    // Sort by stepIndex
    return steps.sort((a, b) => a.stepIndex - b.stepIndex);
  }

  /**
   * Save image metadata
   */
  async saveImage(image: FunnelImage): Promise<void> {
    const imagesDir = this.getImagesDir(image.funnelId);
    this.ensureDir(imagesDir);

    const imagePath = this.getImagePath(image.funnelId, image.id);
    fs.writeFileSync(imagePath, JSON.stringify(image, null, 2), 'utf-8');
  }

  /**
   * Save multiple images
   */
  async saveImages(images: FunnelImage[]): Promise<void> {
    for (const image of images) {
      await this.saveImage(image);
    }
  }

  /**
   * Load a specific image
   */
  async loadImage(funnelId: string, imageId: string): Promise<FunnelImage | null> {
    const imagePath = this.getImagePath(funnelId, imageId);

    if (!fs.existsSync(imagePath)) {
      return null;
    }

    const data = fs.readFileSync(imagePath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Load all images for a funnel (optionally filtered by step)
   */
  async loadImages(funnelId: string, stepId?: string): Promise<FunnelImage[]> {
    const imagesDir = this.getImagesDir(funnelId);

    if (!fs.existsSync(imagesDir)) {
      return [];
    }

    const imageFiles = fs.readdirSync(imagesDir);
    const images: FunnelImage[] = [];

    for (const file of imageFiles) {
      if (file.endsWith('.json')) {
        const imageId = file.replace('.json', '');
        const image = await this.loadImage(funnelId, imageId);
        if (image && (!stepId || image.stepId === stepId)) {
          images.push(image);
        }
      }
    }

    // Sort by generatedAt
    return images.sort((a, b) =>
      new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
    );
  }

  /**
   * Save generation job
   */
  async saveJob(job: GenerationJob): Promise<void> {
    const jobsDir = this.getJobsDir(job.funnelId);
    this.ensureDir(jobsDir);

    const jobPath = this.getJobPath(job.funnelId, job.id);
    fs.writeFileSync(jobPath, JSON.stringify(job, null, 2), 'utf-8');
  }

  /**
   * Load all jobs for a funnel
   */
  async loadJobs(funnelId: string, stepId?: string): Promise<GenerationJob[]> {
    const jobsDir = this.getJobsDir(funnelId);

    if (!fs.existsSync(jobsDir)) {
      return [];
    }

    const jobFiles = fs.readdirSync(jobsDir);
    const jobs: GenerationJob[] = [];

    for (const file of jobFiles) {
      if (file.endsWith('.json')) {
        const data = fs.readFileSync(path.join(jobsDir, file), 'utf-8');
        const job = JSON.parse(data);
        if (!stepId || job.stepId === stepId) {
          jobs.push(job);
        }
      }
    }

    return jobs;
  }
}

// Singleton instance
export const funnelStorage = new FunnelStorage();
