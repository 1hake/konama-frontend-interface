import { WorkflowMetadata, WorkflowGenerationOptions } from '../types';
import { config } from './config';

// Cache for workflows and templates
const workflowsCache = new Map<string, any>();
const workflowTemplatesCache = new Map<string, any>();
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache



/**
 * Load workflows from local files
 */
async function loadWorkflowsFromApi(): Promise<void> {
    const now = Date.now();

    // Use cache if it's still valid
    if (workflowsCache.size > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        console.log('📋 Using cached workflows');
        return;
    }

    console.log('🔄 Loading workflows from local files...');
    await loadFallbackWorkflows();
    lastFetchTime = now;
}



/**
 * Load local workflows from JSON files
 */
async function loadFallbackWorkflows(): Promise<void> {
    try {
        console.log('🔄 Loading local workflow files...');

        // Clear existing cache
        workflowsCache.clear();
        workflowTemplatesCache.clear();

        // Load local workflow files
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
            console.log(`✅ Successfully loaded ${loadedWorkflows} local workflows and ${loadedTemplates} templates`);
        } else {
            console.warn('⚠️  No local workflows could be loaded');

            // Create a minimal fallback workflow if no local workflows exist
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

    } catch (error) {
        console.error('❌ Failed to load local workflows:', error);

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
