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

export interface ImageGenerationHookReturn {
    isGenerating: boolean;
    progress: GenerationProgress | null;
    generatedImages: GeneratedImage[];
    error: string | null;
    generateImage: (prompt: string, negativePrompt?: string, options?: FluxGenerationOptions) => Promise<void>;
    resetGeneration: () => void;
}

export interface ImageGenerationFormProps {
    onGenerate: (prompt: string, negativePrompt?: string, options?: FluxGenerationOptions) => Promise<void>;
    isGenerating: boolean;
    error: string | null;
}

export interface GeneratedImagesDisplayProps {
    images: GeneratedImage[];
    getImageUrl: (image: GeneratedImage) => string;
}