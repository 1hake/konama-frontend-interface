import { ComfyWorkflow, WorkflowMetadata, WorkflowGenerationOptions } from '../types';

// Import workflow configurations
import fluxKreaDevWorkflow from '../workflows/flux-krea-dev.json';
import sd15BasicWorkflow from '../workflows/sd15-basic.json';

/**
 * WorkflowManager - Handles loading, managing, and executing ComfyUI workflows
 */
class WorkflowManager {
    private workflows: Map<string, ComfyWorkflow> = new Map();

    constructor() {
        this.registerDefaultWorkflows();
    }

    /**
     * Register default workflows
     */
    private registerDefaultWorkflows() {
        // Register workflows - metadata is stored in JSON files
        this.workflows.set('flux-krea-dev', {
            metadata: fluxKreaDevWorkflow.metadata as WorkflowMetadata,
            workflow: this.createFluxKreaDevWorkflow
        });

        this.workflows.set('sd15-basic', {
            metadata: sd15BasicWorkflow.metadata as WorkflowMetadata,
            workflow: this.createSD15BasicWorkflow
        });
    }

    /**
     * Get all available workflows
     */
    getAvailableWorkflows(): WorkflowMetadata[] {
        return Array.from(this.workflows.values()).map(w => w.metadata);
    }

    /**
     * Get a specific workflow by ID
     */
    getWorkflow(workflowId: string): ComfyWorkflow | undefined {
        return this.workflows.get(workflowId);
    }

    /**
     * Get workflow metadata
     */
    getWorkflowMetadata(workflowId: string): WorkflowMetadata | undefined {
        return this.workflows.get(workflowId)?.metadata;
    }

    /**
     * Generate workflow JSON for a specific workflow
     */
    generateWorkflowJson(
        workflowId: string,
        positivePrompt: string,
        negativePrompt: string = '',
        options: WorkflowGenerationOptions = {}
    ): any {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        // If workflow.workflow is a function, call it with parameters
        if (typeof workflow.workflow === 'function') {
            return workflow.workflow(positivePrompt, negativePrompt, options);
        }

        // Otherwise, return the workflow as-is (for pre-built workflows)
        return workflow.workflow;
    }

    /**
     * Flux Krea Dev Workflow Generator
     */
    private createFluxKreaDevWorkflow(
        positivePrompt: string,
        negativePrompt: string,
        options: WorkflowGenerationOptions = {}
    ): any {
        const {
            steps = 20,
            aspectRatio = '1:1 (Square)',
            guidance = 3.5,
            loraName = 'CynthiaArch.safetensors',
            loraStrength = 1.0
        } = options;
        const seed = Math.floor(Math.random() * 1000000000000000);

        return {
            "40": {
                "inputs": {
                    "clip_name1": "clip_l.safetensors",
                    "clip_name2": "t5xxl_fp16.safetensors",
                    "type": "flux",
                    "device": "default"
                },
                "class_type": "DualCLIPLoader",
                "_meta": { "title": "DualCLIPLoader" }
            },
            "38": {
                "inputs": {
                    "unet_name": "flux1-krea-dev.safetensors",
                    "weight_dtype": "default"
                },
                "class_type": "UNETLoader",
                "_meta": { "title": "UNETLoader" }
            },
            "39": {
                "inputs": {
                    "vae_name": "ae.safetensors"
                },
                "class_type": "VAELoader",
                "_meta": { "title": "VAELoader" }
            },
            "59": {
                "inputs": {
                    "megapixel": "1.0",
                    "aspect_ratio": aspectRatio,
                    "divisible_by": "64",
                    "custom_ratio": false,
                    "custom_aspect_ratio": "1:1"
                },
                "class_type": "FluxResolutionNode",
                "_meta": { "title": "FluxResolutionNode" }
            },
            "58": {
                "inputs": {
                    "width": ["59", 0],
                    "height": ["59", 1],
                    "batch_size": 1
                },
                "class_type": "EmptySD3LatentImage",
                "_meta": { "title": "EmptySD3LatentImage" }
            },
            "56": {
                "inputs": {
                    "model": ["38", 0],
                    "lora_name": loraName,
                    "strength_model": loraStrength
                },
                "class_type": "LoraLoaderModelOnly",
                "_meta": { "title": "LoraLoaderModelOnly" }
            },
            "45": {
                "inputs": {
                    "text": positivePrompt,
                    "clip": ["40", 0]
                },
                "class_type": "CLIPTextEncode",
                "_meta": { "title": "CLIP Text Encode (Prompt Positif)" }
            },
            "42": {
                "inputs": {
                    "conditioning": ["45", 0]
                },
                "class_type": "ConditioningZeroOut",
                "_meta": { "title": "ConditioningZeroOut" }
            },
            "65": {
                "inputs": {
                    "conditioning": ["45", 0],
                    "guidance": guidance
                },
                "class_type": "FluxGuidance",
                "_meta": { "title": "FluxGuidance" }
            },
            "31": {
                "inputs": {
                    "seed": seed,
                    "steps": steps,
                    "cfg": 1,
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1,
                    "model": ["56", 0],
                    "positive": ["65", 0],
                    "negative": ["42", 0],
                    "latent_image": ["58", 0]
                },
                "class_type": "KSampler",
                "_meta": { "title": "KSampler" }
            },
            "8": {
                "inputs": {
                    "samples": ["31", 0],
                    "vae": ["39", 0]
                },
                "class_type": "VAEDecode",
                "_meta": { "title": "VAEDecode" }
            },
            "9": {
                "inputs": {
                    "filename_prefix": "flux_krea/flux_krea",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage",
                "_meta": { "title": "SaveImage" }
            }
        };
    }

    /**
     * SD 1.5 Basic Workflow Generator
     */
    private createSD15BasicWorkflow(
        positivePrompt: string,
        negativePrompt: string,
        options: WorkflowGenerationOptions = {}
    ): any {
        const {
            steps = 20,
            cfg = 8,
            width = 512,
            height = 512,
            sampler = 'euler',
            scheduler = 'normal',
            checkpoint = 'v1-5-pruned-emaonly-fp16.safetensors'
        } = options;
        const seed = Math.floor(Math.random() * 1000000000000000);

        return {
            "4": {
                "inputs": {
                    "ckpt_name": checkpoint
                },
                "class_type": "CheckpointLoaderSimple",
                "_meta": { "title": "CheckpointLoaderSimple" }
            },
            "5": {
                "inputs": {
                    "width": width,
                    "height": height,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage",
                "_meta": { "title": "EmptyLatentImage" }
            },
            "6": {
                "inputs": {
                    "text": positivePrompt,
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": { "title": "CLIP Text Encode (Positive)" }
            },
            "7": {
                "inputs": {
                    "text": negativePrompt || "text, watermark",
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": { "title": "CLIP Text Encode (Negative)" }
            },
            "3": {
                "inputs": {
                    "seed": seed,
                    "steps": steps,
                    "cfg": cfg,
                    "sampler_name": sampler,
                    "scheduler": scheduler,
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                },
                "class_type": "KSampler",
                "_meta": { "title": "KSampler" }
            },
            "8": {
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2]
                },
                "class_type": "VAEDecode",
                "_meta": { "title": "VAEDecode" }
            },
            "9": {
                "inputs": {
                    "filename_prefix": "sd15/sd15",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage",
                "_meta": { "title": "SaveImage" }
            }
        };
    }

    /**
     * Register a custom workflow
     */
    registerWorkflow(workflow: ComfyWorkflow): void {
        this.workflows.set(workflow.metadata.id, workflow);
    }

    /**
     * Unregister a workflow
     */
    unregisterWorkflow(workflowId: string): boolean {
        return this.workflows.delete(workflowId);
    }
}

// Export a singleton instance
export const workflowManager = new WorkflowManager();
export default workflowManager;
