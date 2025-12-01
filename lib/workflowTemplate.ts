interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    generate: (options: {
        positivePrompt: string;
        negativePrompt?: string;
        [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }) => Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Legacy workflow template system
 * This provides fallback support for workflows that aren't available in the new workflow manager
 */
class WorkflowTemplateManager {
    private templates = new Map<string, WorkflowTemplate>();

    constructor() {
        this.registerTemplates();
    }

    private registerTemplates() {
        // Flux Krea Dev template (legacy)
        this.templates.set('flux-krea-dev', {
            id: 'flux-krea-dev',
            name: 'Flux Krea Dev (Legacy)',
            description: 'Legacy Flux workflow template',
            generate: this.generateFluxTemplate,
        });

        // Basic SD 1.5 template
        this.templates.set('sd15-basic', {
            id: 'sd15-basic',
            name: 'SD 1.5 Basic (Legacy)',
            description: 'Legacy SD 1.5 workflow template',
            generate: this.generateSD15Template,
        });

        // Add more legacy templates as needed
        this.templates.set('default', {
            id: 'default',
            name: 'Default Template',
            description: 'Default fallback template',
            generate: this.generateDefaultTemplate,
        });
    }

    private generateFluxTemplate(options: {
        positivePrompt: string;
        negativePrompt?: string;
        steps?: number;
        guidance?: number;
        width?: number;
        height?: number;
        seed?: number;
    }) {
        const {
            positivePrompt,
            steps = 20,
            width = 1024,
            height = 1024,
            seed = Math.floor(Math.random() * 1000000000000000),
        } = options;

        return {
            prompt: {
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
            },
            client_id: `client-${Date.now()}`,
        };
    }

    private generateSD15Template(options: {
        positivePrompt: string;
        negativePrompt?: string;
        steps?: number;
        cfg?: number;
        width?: number;
        height?: number;
        seed?: number;
        sampler_name?: string;
        scheduler?: string;
    }) {
        const {
            positivePrompt,
            negativePrompt = '',
            steps = 20,
            cfg = 8,
            width = 512,
            height = 512,
            seed = Math.floor(Math.random() * 1000000000000000),
            sampler_name = 'euler',
            scheduler = 'normal',
        } = options;

        return {
            prompt: {
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
            },
            client_id: `client-${Date.now()}`,
        };
    }

    private generateDefaultTemplate(options: {
        positivePrompt: string;
        negativePrompt?: string;
        [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }) {
        // Return a simple default workflow
        const { positivePrompt } = options;

        return {
            prompt: {
                "1": {
                    "inputs": {
                        "text": positivePrompt,
                        "clip": ["2", 1]
                    },
                    "class_type": "CLIPTextEncode",
                    "_meta": {"title": "Positive Prompt"}
                },
                "2": {
                    "inputs": {
                        "ckpt_name": "v1-5-pruned-emaonly.ckpt"
                    },
                    "class_type": "CheckpointLoaderSimple",
                    "_meta": {"title": "Load Checkpoint"}
                }
            },
            client_id: `client-${Date.now()}`,
        };
    }

    getTemplate(id: string): WorkflowTemplate | undefined {
        return this.templates.get(id);
    }

    getAllTemplates(): WorkflowTemplate[] {
        return Array.from(this.templates.values());
    }
}

// Create singleton instance
const templateManager = new WorkflowTemplateManager();

/**
 * Generate workflow using legacy template system
 * This is the main function expected by the route
 */
export function generateWorkflow(
    workflowId: string,
    options: {
        positivePrompt: string;
        negativePrompt?: string;
        [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const template = templateManager.getTemplate(workflowId);
    
    if (!template) {
        console.warn(`Legacy template ${workflowId} not found, using default`);
        const defaultTemplate = templateManager.getTemplate('default');
        if (!defaultTemplate) {
            throw new Error('Default template not found');
        }
        return defaultTemplate.generate(options);
    }

    return template.generate(options);
}

// Export template manager for advanced usage
export { WorkflowTemplateManager, templateManager };