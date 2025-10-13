export interface GenerationProgress {
    promptId: string;
    status: 'queued' | 'executing' | 'completed' | 'error';
    progress?: number;
    node?: string;
    error?: string;
}

export interface GeneratedImage {
    filename: string;
    type: string;
    subfolder: string;
}

export interface FluxGenerationOptions {
    steps?: number;
    aspectRatio?: string;
    guidance?: number;
    loraName?: string;
    loraStrength?: number;
}

// Workflow-related types
export interface WorkflowParameter {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'slider';
    defaultValue: string | number;
    options?: string[] | { label: string; value: string }[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}

export interface WorkflowMetadata {
    id: string;
    name: string;
    description: string;
    category: string;
    author?: string;
    version?: string;
    tags?: string[];
    thumbnail?: string;
    supportsNegativePrompt?: boolean;
    requiredModels?: string[];
    parameters?: WorkflowParameter[];
}

export interface ComfyWorkflow {
    metadata: WorkflowMetadata;
    workflow: any; // The actual ComfyUI workflow JSON structure
}

export interface WorkflowGenerationOptions extends FluxGenerationOptions {
    workflowId?: string;
    customParameters?: Record<string, any>;
    [key: string]: any;
}

export interface ImageGenerationHookReturn {
    isGenerating: boolean;
    progress: GenerationProgress | null;
    generatedImages: GeneratedImage[];
    error: string | null;
    availableWorkflows: WorkflowMetadata[];
    selectedWorkflow: string | null;
    setSelectedWorkflow: (workflowId: string) => void;
    generateImage: (prompt: string, negativePrompt?: string, options?: WorkflowGenerationOptions) => Promise<void>;
    resetGeneration: () => void;
}

export interface ImageGenerationFormProps {
    onGenerate: (prompt: string, negativePrompt?: string, options?: WorkflowGenerationOptions) => Promise<void>;
    isGenerating: boolean;
    error: string | null;
    availableWorkflows?: WorkflowMetadata[];
    selectedWorkflow?: string | null;
    onWorkflowChange?: (workflowId: string) => void;
}

export interface GeneratedImagesDisplayProps {
    images: GeneratedImage[];
    getImageUrl: (image: GeneratedImage) => string;
}