import { WorkflowMetadata, WorkflowGenerationOptions } from '@/types';

interface WorkflowDefinition {
    metadata: WorkflowMetadata;
    workflow: (
        positivePrompt: string,
        negativePrompt?: string,
        options?: WorkflowGenerationOptions
    ) => Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

class WorkflowManager {
    private workflows = new Map<string, WorkflowDefinition>();

    constructor() {
        this.registerDefaultWorkflows();
    }

    /**
     * Register default workflows
     */
    private registerDefaultWorkflows() {
        // Register Flux Krea Dev workflow
        this.workflows.set('flux-krea-dev', {
            metadata: {
                id: 'flux-krea-dev',
                name: 'Flux Krea Dev',
                description: 'Advanced Flux model with LoRA support and dynamic resolution',
                category: 'flux',
                version: '1.0.0',
                supportsNegativePrompt: true,
                source: 'local' as const,
                lastFetched: new Date(),
                tags: ['flux', 'dev', 'high-quality'],
                author: 'Flux Team',
                requiredModels: ['flux1-dev.safetensors'],
                parameters: [
                    {
                        name: 'steps',
                        label: 'Steps',
                        type: 'slider' as const,
                        defaultValue: 20,
                        min: 1,
                        max: 50,
                        step: 1,
                    },
                    {
                        name: 'guidance',
                        label: 'Guidance',
                        type: 'slider' as const,
                        defaultValue: 3.5,
                        min: 1,
                        max: 10,
                        step: 0.1,
                    },
                ],
            },
            workflow: this.createFluxWorkflow,
        });

        // Register SD 1.5 Basic workflow
        this.workflows.set('sd15-basic', {
            metadata: {
                id: 'sd15-basic',
                name: 'Stable Diffusion 1.5 Basic',
                description: 'Classic SD 1.5 workflow with KSampler',
                category: 'stable-diffusion',
                version: '1.0.0',
                supportsNegativePrompt: true,
                source: 'local' as const,
                lastFetched: new Date(),
                tags: ['sd15', 'basic', 'fast'],
                author: 'Stability AI',
                requiredModels: ['v1-5-pruned-emaonly.ckpt'],
                parameters: [
                    {
                        name: 'steps',
                        label: 'Steps',
                        type: 'slider' as const,
                        defaultValue: 20,
                        min: 1,
                        max: 150,
                        step: 1,
                    },
                    {
                        name: 'cfg',
                        label: 'CFG Scale',
                        type: 'slider' as const,
                        defaultValue: 8,
                        min: 1,
                        max: 20,
                        step: 0.5,
                    },
                ],
            },
            workflow: this.createSD15Workflow,
        });
    }

    /**
     * Get all available workflows
     */
    getAvailableWorkflows(): WorkflowMetadata[] {
        return Array.from(this.workflows.values()).map(def => def.metadata);
    }

    /**
     * Get specific workflow metadata
     */
    getWorkflow(id: string): WorkflowMetadata | null {
        const workflow = this.workflows.get(id);
        return workflow ? workflow.metadata : null;
    }

    /**
     * Generate workflow JSON for a specific workflow
     */
    async generateWorkflowJson(
        workflowId: string,
        positivePrompt: string,
        negativePrompt?: string,
        options: WorkflowGenerationOptions = {}
    ): Promise<Record<string, any>> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const workflowDef = this.workflows.get(workflowId);
        
        if (!workflowDef) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        return workflowDef.workflow.call(this, positivePrompt, negativePrompt, options);
    }

    /**
     * Create Flux workflow JSON
     */
    private createFluxWorkflow(
        positivePrompt: string,
        _negativePrompt?: string,
        options: WorkflowGenerationOptions = {}
    ): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const {
            steps = 20,
            width = 1024,
            height = 1024,
            seed = Math.floor(Math.random() * 1000000000000000),
        } = options;

        return {
            "6": {
                "inputs": {
                    "text": positivePrompt,
                    "clip": ["11", 0]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Prompt)"}
            },
            "8": {
                "inputs": {
                    "samples": ["13", 0],
                    "vae": ["10", 0]
                },
                "class_type": "VAEDecode",
                "_meta": {"title": "VAE Decode"}
            },
            "9": {
                "inputs": {
                    "filename_prefix": "ComfyUI",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage",
                "_meta": {"title": "Save Image"}
            },
            "10": {
                "inputs": {
                    "vae_name": "ae.safetensors"
                },
                "class_type": "VAELoader",
                "_meta": {"title": "Load VAE"}
            },
            "11": {
                "inputs": {
                    "clip_name": "t5xxl_fp8_e4m3fn.safetensors"
                },
                "class_type": "CLIPLoader",
                "_meta": {"title": "Load CLIP"}
            },
            "12": {
                "inputs": {
                    "unet_name": "flux1-dev.safetensors"
                },
                "class_type": "UNETLoader",
                "_meta": {"title": "Load Diffusion Model"}
            },
            "13": {
                "inputs": {
                    "noise": ["25", 0],
                    "guider": ["22", 0],
                    "sampler": ["16", 0],
                    "sigmas": ["17", 0],
                    "latent_image": ["27", 0]
                },
                "class_type": "SamplerCustomAdvanced",
                "_meta": {"title": "SamplerCustomAdvanced"}
            },
            "16": {
                "inputs": {
                    "sampler_name": "euler"
                },
                "class_type": "KSamplerSelect",
                "_meta": {"title": "KSamplerSelect"}
            },
            "17": {
                "inputs": {
                    "scheduler": "simple",
                    "steps": steps,
                    "denoise": 1,
                    "model": ["12", 0]
                },
                "class_type": "BasicScheduler",
                "_meta": {"title": "BasicScheduler"}
            },
            "22": {
                "inputs": {
                    "model": ["12", 0],
                    "conditioning": ["6", 0]
                },
                "class_type": "BasicGuider",
                "_meta": {"title": "BasicGuider"}
            },
            "25": {
                "inputs": {
                    "noise_seed": seed
                },
                "class_type": "RandomNoise",
                "_meta": {"title": "RandomNoise"}
            },
            "27": {
                "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage",
                "_meta": {"title": "Empty Latent Image"}
            }
        };
    }

    /**
     * Create SD 1.5 workflow JSON
     */
    private createSD15Workflow(
        positivePrompt: string,
        negativePrompt: string = '',
        options: WorkflowGenerationOptions = {}
    ): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const {
            steps = 20,
            cfg = 8,
            width = 512,
            height = 512,
            seed = Math.floor(Math.random() * 1000000000000000),
            sampler_name = 'euler',
            scheduler = 'normal',
        } = options;

        return {
            "3": {
                "inputs": {
                    "seed": seed,
                    "steps": steps,
                    "cfg": cfg,
                    "sampler_name": sampler_name,
                    "scheduler": scheduler,
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                },
                "class_type": "KSampler",
                "_meta": {"title": "KSampler"}
            },
            "4": {
                "inputs": {
                    "ckpt_name": "v1-5-pruned-emaonly.ckpt"
                },
                "class_type": "CheckpointLoaderSimple",
                "_meta": {"title": "Load Checkpoint"}
            },
            "5": {
                "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage",
                "_meta": {"title": "Empty Latent Image"}
            },
            "6": {
                "inputs": {
                    "text": positivePrompt,
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Prompt)"}
            },
            "7": {
                "inputs": {
                    "text": negativePrompt,
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Negative)"}
            },
            "8": {
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2]
                },
                "class_type": "VAEDecode",
                "_meta": {"title": "VAE Decode"}
            },
            "9": {
                "inputs": {
                    "filename_prefix": "ComfyUI",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage",
                "_meta": {"title": "Save Image"}
            }
        };
    }
}

// Export singleton instance
export const workflowManager = new WorkflowManager();

// Export the class for testing
export { WorkflowManager };

// Export the function that the route expects
export async function generateWorkflowJson(
    workflowId: string,
    positivePrompt: string,
    negativePrompt?: string,
    options: WorkflowGenerationOptions = {}
): Promise<Record<string, any>> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return workflowManager.generateWorkflowJson(workflowId, positivePrompt, negativePrompt, options);
}