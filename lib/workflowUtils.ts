/**
 * Utility functions for workflow conversion
 */

import {
    processWorkflow,
    ApiWorkflow,
    ApiWorkflowNode,
} from './workflowConverter';

/**
 * Converts any workflow input to API format with error handling
 * @param input - Workflow in normal format, JSON string, or file path
 * @returns Promise<ApiWorkflow | null>
 */
export async function convertToApiFormat(
    input: unknown
): Promise<ApiWorkflow | null> {
    try {
        // Handle different input types
        let workflow = input;

        if (typeof input === 'string') {
            // Check if it's a file path
            if (input.endsWith('.json')) {
                const fs = await import('fs');
                workflow = JSON.parse(fs.readFileSync(input, 'utf-8'));
            } else {
                // Assume it's a JSON string
                workflow = JSON.parse(input);
            }
        }

        return processWorkflow(workflow);
    } catch (error) {
        console.error('❌ Error in convertToApiFormat:', error);
        return null;
    }
}

/**
 * Validates if a workflow is in normal format (needs conversion)
 * @param workflow - Workflow object to check
 * @returns boolean - true if it's normal format, false if API format
 */
export function isNormalFormat(workflow: unknown): boolean {
    if (!workflow || typeof workflow !== 'object') {
        return false;
    }

    const workflowObj = workflow as Record<string, unknown>;

    // Normal format has nodes and links arrays
    if (
        workflowObj.nodes &&
        Array.isArray(workflowObj.nodes) &&
        workflowObj.links &&
        Array.isArray(workflowObj.links)
    ) {
        return true;
    }

    // API format has numbered string keys with class_type
    const keys = Object.keys(workflow);
    if (keys.length > 0) {
        const firstKey = keys[0];
        return !(workflow[firstKey] && workflow[firstKey].class_type);
    }

    return false;
}

/**
 * Automatically converts workflow if needed, otherwise returns as-is
 * @param workflow - Workflow in any format
 * @returns Promise<ApiWorkflow | null>
 */
export async function ensureApiFormat(
    workflow: Record<string, unknown>
): Promise<ApiWorkflow | null> {
    if (!workflow) {
        return null;
    }

    if (isNormalFormat(workflow)) {
        console.log('🔄 Auto-converting workflow to API format');
        return convertToApiFormat(workflow);
    } else {
        console.log('✅ Workflow already in API format');
        return workflow as ApiWorkflow;
    }
}

/**
 * Creates a ready-to-send payload for ComfyUI API
 * @param workflow - Workflow in any format
 * @param clientId - Optional client ID for tracking
 * @returns Promise<object | null> - Ready to send to /prompt endpoint
 */
export async function createComfyPayload(
    workflow: Record<string, unknown>,
    clientId?: string
): Promise<{ prompt: ApiWorkflow; client_id?: string } | null> {
    const apiWorkflow = await ensureApiFormat(workflow);

    if (!apiWorkflow) {
        return null;
    }

    const payload: { prompt: ApiWorkflow; client_id?: string } = {
        prompt: apiWorkflow,
    };

    if (clientId) {
        payload.client_id = clientId;
    }

    return payload;
}

/**
 * Helper to extract text prompts from API workflow
 * @param apiWorkflow - API format workflow
 * @returns object with positive and negative prompts
 */
export function extractPrompts(apiWorkflow: ApiWorkflow): {
    positive: string[];
    negative: string[];
} {
    const positive: string[] = [];
    const negative: string[] = [];

    for (const [, node] of Object.entries(apiWorkflow)) {
        if (node.class_type === 'CLIPTextEncode') {
            const text = node.inputs.text;
            if (typeof text === 'string') {
                // Determine if positive or negative based on connections or naming
                const title = node._meta?.title?.toLowerCase() || '';
                if (title.includes('negative') || title.includes('neg')) {
                    negative.push(text);
                } else {
                    positive.push(text);
                }
            }
        }
    }

    return { positive, negative };
}

/**
 * Updates text prompts in an API workflow
 * @param apiWorkflow - API format workflow
 * @param updates - Object with nodeId -> new text mappings
 * @returns Modified workflow
 */
export function updatePrompts(
    apiWorkflow: ApiWorkflow,
    updates: Record<string, string>
): ApiWorkflow {
    const modified = { ...apiWorkflow };

    for (const [nodeId, newText] of Object.entries(updates)) {
        if (
            modified[nodeId] &&
            modified[nodeId].class_type === 'CLIPTextEncode'
        ) {
            modified[nodeId] = {
                ...modified[nodeId],
                inputs: {
                    ...modified[nodeId].inputs,
                    text: newText,
                },
            };
        }
    }

    return modified;
}

/**
 * Finds nodes of specific type in API workflow
 * @param apiWorkflow - API format workflow
 * @param nodeType - Class type to search for
 * @returns Array of [nodeId, node] pairs
 */
export function findNodesByType(
    apiWorkflow: ApiWorkflow,
    nodeType: string
): Array<[string, ApiWorkflowNode]> {
    return Object.entries(apiWorkflow).filter(
        ([, node]) => node.class_type === nodeType
    );
}

/**
 * Updates parameters for nodes of a specific type
 * @param apiWorkflow - API format workflow
 * @param nodeType - Class type to update
 * @param updates - Parameters to update
 * @returns Modified workflow
 */
export function updateNodeParams(
    apiWorkflow: ApiWorkflow,
    nodeType: string,
    updates: Record<string, unknown>
): ApiWorkflow {
    const modified = { ...apiWorkflow };

    for (const [nodeId, node] of Object.entries(modified)) {
        if (node.class_type === nodeType) {
            modified[nodeId] = {
                ...node,
                inputs: {
                    ...node.inputs,
                    ...updates,
                },
            };
        }
    }

    return modified;
}
