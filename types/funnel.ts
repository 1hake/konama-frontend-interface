/**
 * Funnel Feature Type Definitions
 *
 * A Funnel is a multi-stage iterative image-generation pipeline that allows
 * users to generate batches across multiple workflows, select the best images,
 * and refine them through multiple steps.
 */

export type FunnelStepStatus =
    | 'pending'
    | 'generating'
    | 'selecting'
    | 'completed';

export interface FunnelStep {
    id: string;
    funnelId: string;
    stepIndex: number;
    status: FunnelStepStatus;
    createdAt: string;
    completedAt?: string;
    // Parent step ID for tracking refinement chains
    parentStepId?: string;
    // Number of images generated in this step
    imageCount: number;
    // Number of images selected from this step
    selectedCount: number;
    // Store prompt fields for this step
    promptFields?: {
        sujet: string;
        contexte: string;
        decor: string;
        composition: string;
        technique: string;
        ambiance: string;
        details: string;
        parametres: string;
    };
    // Store technical parameters for this step
    technicalParameters?: {
        steps: number;
        guidance: number;
        aspectRatio: string;
        loraName: string;
        loraStrength: number;
        negatifs: string;
    };
}

export interface FunnelImage {
    id: string;
    stepId: string;
    funnelId: string;
    // Image file information
    filename: string;
    type: string;
    subfolder: string;
    // Generation metadata
    workflowId: string;
    seed: number;
    parameters: Record<string, any>;
    prompt: string;
    negativePrompt?: string;
    // Selection state
    selected: boolean;
    // Parent image ID if this is a refinement
    parentImageId?: string;
    // Timestamps
    generatedAt: string;
    // Generation job ID for tracking
    jobId?: string;
}

export interface FunnelConfig {
    // Multiple workflow IDs for parallel generation
    selectedWorkflows: string[];
    // Base prompt applied to all workflows
    basePrompt: string;
    baseNegativePrompt?: string;
    // Base parameters that can be overridden per workflow
    baseParameters: Record<string, any>;
    // Number of images to generate per workflow
    imagesPerWorkflow?: number;
}

export interface Funnel {
    id: string;
    name: string;
    description?: string;
    config: FunnelConfig;
    steps: FunnelStep[];
    currentStepIndex: number;
    status: 'active' | 'paused' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface FunnelRefinement {
    imageId: string;
    // Overrides for this specific image
    prompt?: string;
    negativePrompt?: string;
    seed?: number;
    workflowId?: string;
    parameters?: Record<string, any>;
}

export interface GenerationJob {
    id: string;
    stepId: string;
    funnelId: string;
    workflowId: string;
    prompt: string;
    negativePrompt?: string;
    parameters: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
    error?: string;
    startedAt?: string;
    completedAt?: string;
    resultImageIds?: string[];
}

export interface FunnelState {
    funnel: Funnel;
    currentStep: FunnelStep | null;
    steps: FunnelStep[];
    images: FunnelImage[];
    selectedImages: FunnelImage[];
    jobs: GenerationJob[];
}

export interface CreateFunnelRequest {
    name: string;
    description?: string;
    config: FunnelConfig;
}

export interface GenerateStepRequest {
    refinements?: FunnelRefinement[];
}

export interface SelectImagesRequest {
    imageIds: string[];
}

export interface CreateNextStepRequest {
    selectedImageIds: string[];
    refinements?: FunnelRefinement[];
    promptFields?: {
        sujet: string;
        contexte: string;
        decor: string;
        composition: string;
        technique: string;
        ambiance: string;
        details: string;
        parametres: string;
    };
    technicalParameters?: {
        steps: number;
        guidance: number;
        aspectRatio: string;
        loraName: string;
        loraStrength: number;
        negatifs: string;
    };
}
