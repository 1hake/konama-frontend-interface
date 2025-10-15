import { WorkflowMetadata, WorkflowGenerationOptions } from '../types';
import { config } from './config';

// Cache for workflows and templates
const workflowsCache = new Map<string, any>();
const workflowTemplatesCache = new Map<string, any>();
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetch object info from ComfyUI API via proxy
 */
async function fetchObjectInfo(): Promise<any> {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
        // In browser, use the proxy endpoint to avoid CORS issues
        console.log('🔄 Fetching object info via proxy: /api/object-info');
        
        const response = await fetch('/api/object-info');
        if (!response.ok) {
            console.error('❌ Failed to fetch object info via proxy:', response.status, response.statusText);
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Failed to fetch object info: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('✅ Successfully fetched object info via proxy, available nodes:', Object.keys(data).length);
        return data;
    } else {
        // In server environment, call ComfyUI API directly
        const comfyApiUrl = config.comfyApiUrl;
        if (!comfyApiUrl) {
            throw new Error('ComfyUI API URL not configured');
        }

        console.log('🔄 Fetching object info directly from:', `${comfyApiUrl}/object_info`);

        const response = await fetch(`${comfyApiUrl}/object_info`);
        if (!response.ok) {
            console.error('❌ Failed to fetch object info:', response.status, response.statusText);
            throw new Error(`Failed to fetch object info: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Successfully fetched object info directly, available nodes:', Object.keys(data).length);
        return data;
    }
}

/**
 * Load workflows from object_info endpoint
 */
async function loadWorkflowsFromApi(): Promise<void> {
    const now = Date.now();

    // Use cache if it's still valid
    if (workflowsCache.size > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        console.log('📋 Using cached workflows');
        return;
    }

    try {
        // Check if we're in a server environment and have the API URL
        const comfyApiUrl = config.comfyApiUrl;
        if (!comfyApiUrl) {
            console.warn('⚠️  ComfyUI API URL not configured, falling back to local workflows');
            await loadFallbackWorkflows();
            return;
        }

        console.log('🔄 Loading workflows from ComfyUI API...');
        const objectInfo = await fetchObjectInfo();

        // Clear existing cache
        workflowsCache.clear();
        workflowTemplatesCache.clear();

        const availableNodes = Object.keys(objectInfo);
        const fetchTime = new Date();

        // Extract workflow information from object_info
        // Check if workflows are directly available in object_info
        if (objectInfo && objectInfo.workflows) {
            console.log('📋 Found workflows in object_info:', Object.keys(objectInfo.workflows));
            Object.entries(objectInfo.workflows).forEach(([workflowId, workflowData]: [string, any]) => {
                // Add source information to metadata
                if (workflowData.metadata) {
                    workflowData.metadata.source = 'api';
                    workflowData.metadata.availableNodes = availableNodes.slice(0, 50); // Limit to first 50 nodes
                    workflowData.metadata.lastFetched = fetchTime;
                }
                workflowsCache.set(workflowId, workflowData);

                // If there's a template associated, cache it too
                if (workflowData.template) {
                    workflowTemplatesCache.set(workflowData.workflowTemplate || workflowId, workflowData.template);
                }
            });
        } else {
            // Fallback: create default workflows from available nodes
            console.log('📋 No workflows found in object_info, creating default workflows from available nodes');
            const defaultWorkflows = createDefaultWorkflowsFromNodes(objectInfo, availableNodes, fetchTime);
            defaultWorkflows.forEach((workflow, id) => {
                workflowsCache.set(id, workflow);
            });
            console.log('✅ Created default workflows:', Array.from(defaultWorkflows.keys()));
        }

        lastFetchTime = now;
        console.log('✅ Successfully loaded workflows from API');
    } catch (error) {
        console.error('❌ Failed to load workflows from API:', error);

        // If API fails, fall back to local workflows (if available)
        console.log('🔄 Falling back to local workflows...');
        await loadFallbackWorkflows();
    }
}

/**
 * Create a basic Flux workflow template from available nodes
 */
function createBasicFluxWorkflowTemplate(availableNodes: string[]): any {
    // Create a simplified Flux workflow that should work with most setups
    return {
        "1": {
            inputs: {
                ckpt_name: "flux1-dev.safetensors"
            },
            class_type: "CheckpointLoaderSimple",
            _meta: { title: "Load Checkpoint" }
        },
        "2": {
            inputs: {
                text: "{{positivePrompt}}",
                clip: ["1", 1]
            },
            class_type: "CLIPTextEncode",
            _meta: { title: "Positive Prompt" }
        },
        "3": {
            inputs: {
                text: "{{negativePrompt}}",
                clip: ["1", 1]
            },
            class_type: "CLIPTextEncode",
            _meta: { title: "Negative Prompt" }
        },
        "4": {
            inputs: {
                width: 1024,
                height: 1024,
                batch_size: 1
            },
            class_type: "EmptyLatentImage",
            _meta: { title: "Empty Latent Image" }
        },
        "5": {
            inputs: {
                seed: "{{seed}}",
                steps: "{{steps}}",
                cfg: 1.0,
                sampler_name: "euler",
                scheduler: "simple",
                denoise: 1.0,
                model: ["1", 0],
                positive: ["2", 0],
                negative: ["3", 0],
                latent_image: ["4", 0]
            },
            class_type: "KSampler",
            _meta: { title: "KSampler" }
        },
        "6": {
            inputs: {
                samples: ["5", 0],
                vae: ["1", 2]
            },
            class_type: "VAEDecode",
            _meta: { title: "VAE Decode" }
        },
        "7": {
            inputs: {
                filename_prefix: "ComfyUI",
                images: ["6", 0]
            },
            class_type: "SaveImage",
            _meta: { title: "Save Image" }
        }
    };
}

/**
 * Create a basic Stable Diffusion workflow template from available nodes
 */
function createBasicSDWorkflowTemplate(availableNodes: string[]): any {
    // Create a basic SD workflow structure
    const workflow: any = {};
    let nodeId = 1;

    // Add checkpoint loader
    workflow[nodeId] = {
        inputs: {
            ckpt_name: "v1-5-pruned-emaonly.ckpt"
        },
        class_type: "CheckpointLoaderSimple",
        _meta: { title: "Load Checkpoint" }
    };
    nodeId++;

    // Add positive prompt
    workflow[nodeId] = {
        inputs: {
            text: "{{positivePrompt}}",
            clip: ["1", 1]
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "Positive Prompt" }
    };
    nodeId++;

    // Add negative prompt
    workflow[nodeId] = {
        inputs: {
            text: "{{negativePrompt}}",
            clip: ["1", 1]
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "Negative Prompt" }
    };
    nodeId++;

    // Add empty latent image
    workflow[nodeId] = {
        inputs: {
            width: 512,
            height: 512,
            batch_size: 1
        },
        class_type: "EmptyLatentImage",
        _meta: { title: "Empty Latent Image" }
    };
    nodeId++;

    // Add KSampler
    workflow[nodeId] = {
        inputs: {
            seed: "{{seed}}",
            steps: "{{steps}}",
            cfg: 7.0,
            sampler_name: "euler",
            scheduler: "normal",
            denoise: 1.0,
            model: ["1", 0],
            positive: ["2", 0],
            negative: ["3", 0],
            latent_image: ["4", 0]
        },
        class_type: "KSampler",
        _meta: { title: "KSampler" }
    };
    nodeId++;

    // Add VAE decode
    workflow[nodeId] = {
        inputs: {
            samples: ["5", 0],
            vae: ["1", 2]
        },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" }
    };
    nodeId++;

    // Add save image
    workflow[nodeId] = {
        inputs: {
            filename_prefix: "ComfyUI",
            images: ["6", 0]
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" }
    };

    return workflow;
}

/**
 * Create default workflows from available nodes (fallback)
 */
function createDefaultWorkflowsFromNodes(objectInfo: any, availableNodes?: string[], fetchTime?: Date): Map<string, any> {
    const defaultWorkflows = new Map();

    if (objectInfo) {
        const nodes = availableNodes || Object.keys(objectInfo);
        console.log('📋 Available ComfyUI nodes:', nodes.slice(0, 10), '... (showing first 10)');

        // Check for Flux-related nodes
        const hasFluxNodes = nodes.some(node =>
            node.toLowerCase().includes('flux') ||
            node.includes('FluxGuidance') ||
            node.includes('DualCLIPLoader')
        );

        // Check for basic sampling nodes
        const hasKSampler = nodes.includes('KSampler') || nodes.includes('KSamplerAdvanced');
        const hasCheckpointLoader = nodes.includes('CheckpointLoaderSimple');
        const hasCLIPTextEncode = nodes.includes('CLIPTextEncode');

        // Create basic workflows based on available nodes
        if (hasFluxNodes && hasKSampler) {
            // Create the workflow metadata
            defaultWorkflows.set('flux-basic', {
                metadata: {
                    id: 'flux-basic',
                    name: 'Basic Flux (Auto-detected)',
                    description: 'Basic Flux workflow created from available ComfyUI nodes',
                    category: 'flux',
                    version: '1.0.0',
                    supportsNegativePrompt: true,
                    source: 'auto-detected',
                    availableNodes: nodes.slice(0, 50),
                    lastFetched: fetchTime || new Date(),
                    parameters: [
                        {
                            name: 'steps',
                            label: 'Steps',
                            type: 'slider',
                            defaultValue: 20,
                            min: 1,
                            max: 50,
                            step: 1
                        }
                    ]
                },
                workflowTemplate: 'flux-basic'
            });

            // Create a basic Flux workflow template
            const fluxTemplate = createBasicFluxWorkflowTemplate(nodes);
            workflowTemplatesCache.set('flux-basic', fluxTemplate);
        }

        if (hasKSampler && hasCheckpointLoader && hasCLIPTextEncode) {
            // Create the workflow metadata
            defaultWorkflows.set('sd-basic', {
                metadata: {
                    id: 'sd-basic',
                    name: 'Basic Stable Diffusion (Auto-detected)',
                    description: 'Basic Stable Diffusion workflow created from available ComfyUI nodes',
                    category: 'stable-diffusion',
                    version: '1.0.0',
                    supportsNegativePrompt: true,
                    source: 'auto-detected',
                    availableNodes: nodes.slice(0, 50),
                    lastFetched: fetchTime || new Date(),
                    parameters: [
                        {
                            name: 'steps',
                            label: 'Steps',
                            type: 'slider',
                            defaultValue: 20,
                            min: 1,
                            max: 50,
                            step: 1
                        }
                    ]
                },
                workflowTemplate: 'sd-basic'
            });

            // Create a basic SD workflow template
            const sdTemplate = createBasicSDWorkflowTemplate(nodes);
            workflowTemplatesCache.set('sd-basic', sdTemplate);
        }

        // If no specific workflows can be created, create a generic one
        if (defaultWorkflows.size === 0 && hasKSampler) {
            // Create the workflow metadata
            defaultWorkflows.set('generic', {
                metadata: {
                    id: 'generic',
                    name: 'Generic Workflow (Auto-detected)',
                    description: 'Generic workflow created from available ComfyUI nodes',
                    category: 'generic',
                    version: '1.0.0',
                    supportsNegativePrompt: false,
                    source: 'auto-detected',
                    availableNodes: nodes.slice(0, 50),
                    lastFetched: fetchTime || new Date(),
                    parameters: []
                },
                workflowTemplate: 'generic'
            });

            // Create a generic workflow template (use SD template as fallback)
            const genericTemplate = createBasicSDWorkflowTemplate(nodes);
            workflowTemplatesCache.set('generic', genericTemplate);
        }
    }

    return defaultWorkflows;
}

/**
 * Fallback to local workflows if API fails
 */
async function loadFallbackWorkflows(): Promise<void> {
    try {
        console.log('🔄 Loading local workflow files as fallback...');

        // Try to load local workflow files as fallback
        const workflowImports = await Promise.allSettled([
            import('../workflows/flux-krea-dev.json'),
            import('../workflows/sd15-basic.json'),
            import('../workflows/templates/flux-krea-dev.json'),
            import('../workflows/templates/sd15-basic.json')
        ]);

        // Handle flux-krea-dev workflow
        if (workflowImports[0].status === 'fulfilled') {
            const workflowData = workflowImports[0].value.default;
            // Add source information to metadata
            if (workflowData.metadata) {
                (workflowData.metadata as any).source = 'local';
                (workflowData.metadata as any).lastFetched = new Date();
            }
            workflowsCache.set('flux-krea-dev', workflowData);
            console.log('✅ Loaded flux-krea-dev workflow');
        }

        // Handle sd15-basic workflow
        if (workflowImports[1].status === 'fulfilled') {
            const workflowData = workflowImports[1].value.default;
            // Add source information to metadata
            if (workflowData.metadata) {
                (workflowData.metadata as any).source = 'local';
                (workflowData.metadata as any).lastFetched = new Date();
            }
            workflowsCache.set('sd15-basic', workflowData);
            console.log('✅ Loaded sd15-basic workflow');
        }

        // Handle flux-krea-dev template
        if (workflowImports[2].status === 'fulfilled') {
            workflowTemplatesCache.set('flux-krea-dev', workflowImports[2].value.default);
            console.log('✅ Loaded flux-krea-dev template');
        }

        // Handle sd15-basic template
        if (workflowImports[3].status === 'fulfilled') {
            workflowTemplatesCache.set('sd15-basic', workflowImports[3].value.default);
            console.log('✅ Loaded sd15-basic template');
        }

        const loadedWorkflows = workflowsCache.size;
        const loadedTemplates = workflowTemplatesCache.size;

        if (loadedWorkflows > 0) {
            console.log(`✅ Successfully loaded ${loadedWorkflows} fallback workflows and ${loadedTemplates} templates`);
        } else {
            console.warn('⚠️  No fallback workflows could be loaded');
        }

    } catch (error) {
        console.warn('❌ Failed to load fallback workflows:', error);

        // Create a minimal fallback workflow if all else fails
        const minimalWorkflow = {
            metadata: {
                id: 'minimal',
                name: 'Minimal Workflow',
                description: 'Minimal fallback workflow when no other workflows are available',
                category: 'fallback',
                version: '1.0.0',
                supportsNegativePrompt: false,
                source: 'fallback' as const,
                lastFetched: new Date(),
                parameters: []
            },
            workflowTemplate: 'minimal'
        };

        workflowsCache.set('minimal', minimalWorkflow);
        console.log('⚠️  Created minimal fallback workflow');
    }
}

/**
 * Get all available workflows
 */
export async function getAvailableWorkflows(): Promise<WorkflowMetadata[]> {
    await loadWorkflowsFromApi();
    return Array.from(workflowsCache.values()).map((w: any) => w.metadata as WorkflowMetadata);
}

/**
 * Get workflow metadata by ID
 */
export async function getWorkflowMetadata(workflowId: string): Promise<WorkflowMetadata | undefined> {
    await loadWorkflowsFromApi();
    const workflow = workflowsCache.get(workflowId);
    return workflow?.metadata as WorkflowMetadata;
}

/**
 * Generate workflow JSON for a specific workflow
 */
export async function generateWorkflowJson(
    workflowId: string,
    positivePrompt: string,
    negativePrompt: string = '',
    options: WorkflowGenerationOptions = {}
): Promise<any> {
    await loadWorkflowsFromApi();

    const workflow = workflowsCache.get(workflowId);
    if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
    }

    const templateName = workflow.workflowTemplate;
    const template = workflowTemplatesCache.get(templateName);
    if (!template) {
        throw new Error(`Workflow template ${templateName} not found`);
    }

    return generateWorkflowFromTemplate(template, positivePrompt, negativePrompt, options, workflow.metadata);
}

/**
 * Generate workflow from template by replacing placeholders
 */
function generateWorkflowFromTemplate(
    template: any,
    positivePrompt: string,
    negativePrompt: string,
    options: WorkflowGenerationOptions,
    metadata: WorkflowMetadata
): any {
    // Get default values from metadata parameters
    const defaults: Record<string, any> = {};
    if (metadata.parameters) {
        metadata.parameters.forEach(param => {
            defaults[param.name] = param.defaultValue;
        });
    }

    // Merge with provided options
    const params = { ...defaults, ...options };

    // Generate random seed
    const seed = Math.floor(Math.random() * 1000000000000000);

    // Create replacement values
    const replacements = {
        positivePrompt,
        negativePrompt: negativePrompt || "text, watermark",
        seed,
        ...params
    };

    // Convert template to string, replace placeholders, then parse back
    let workflowString = JSON.stringify(template);

    // Replace all {{placeholder}} with actual values
    Object.entries(replacements).forEach(([key, value]) => {
        const placeholder = `"{{${key}}}"`;
        const replacement = typeof value === 'string' ? `"${value}"` : String(value);
        workflowString = workflowString.replace(new RegExp(placeholder, 'g'), replacement);
    });

    return JSON.parse(workflowString);
}



/**
 * Register a custom workflow
 */
export function registerWorkflow(workflowId: string, workflowData: any): void {
    workflowsCache.set(workflowId, workflowData);
}

/**
 * Unregister a workflow
 */
export function unregisterWorkflow(workflowId: string): boolean {
    return workflowsCache.delete(workflowId);
}

/**
 * Force refresh workflows from API
 */
export async function refreshWorkflows(): Promise<void> {
    console.log('🔄 Force refreshing workflows...');
    lastFetchTime = 0; // Reset cache time
    workflowsCache.clear();
    workflowTemplatesCache.clear();
    await loadWorkflowsFromApi();
}

// Export individual functions as default for backwards compatibility
export default {
    getAvailableWorkflows,
    getWorkflowMetadata,
    generateWorkflowJson,
    registerWorkflow,
    unregisterWorkflow,
    refreshWorkflows
};
