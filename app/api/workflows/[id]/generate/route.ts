import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workflows/[id]/generate - Generate workflow JSON for a specific workflow
 * This endpoint fetches the workflow template and processes the prompts
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { positivePrompt, negativePrompt, options = {} } = body;

        console.log('=== WORKFLOW GENERATION REQUEST ===');
        console.log('🆔 Workflow ID:', id);
        console.log('📝 Positive Prompt:', positivePrompt);
        console.log('📝 Negative Prompt:', negativePrompt);
        console.log('⚙️ Options:', options);

        // First, fetch all workflows from the external service to find the one we need
        const workflowsResponse = await fetch(`${config.workflowApiUrl}/workflows`);

        if (!workflowsResponse.ok) {
            throw new Error(`Failed to fetch workflows: ${workflowsResponse.status} ${workflowsResponse.statusText}`);
        }

        const workflowsData = await workflowsResponse.json();

        // Find the workflow by ID (either by the workflow content ID or by the filename)
        let targetWorkflow = null;

        if (workflowsData.data && Array.isArray(workflowsData.data)) {
            targetWorkflow = workflowsData.data.find((item: Record<string, unknown>) => {
                const workflowContentId = (item.content as Record<string, unknown>)?.content as Record<string, unknown>;
                const workflowName = (item.content as Record<string, unknown>)?.name as string;

                // Match by either the internal workflow ID or the filename (without extension)
                return (workflowContentId?.id as string) === id || workflowName?.replace(/^workflows\//, '').replace(/\.json$/, '') === id;
            });
        }

        if (!targetWorkflow) {
            throw new Error(`Workflow with ID "${id}" not found`);
        }

        // Get the workflow content
        const workflow = JSON.parse(JSON.stringify(targetWorkflow.content.content));

        console.log('✅ Found workflow:', targetWorkflow.content.name);
        console.log('🔍 Original workflow nodes count:', workflow.nodes?.length || 0);
        console.log('🔍 First node before processing:', JSON.stringify(workflow.nodes?.[0], null, 2));

        // Process the workflow to inject prompts and parameters
        const processedWorkflow = processWorkflowPrompts(workflow, {
            positivePrompt,
            negativePrompt,
            ...options
        });

        console.log('🔍 First node after processing:', JSON.stringify(processedWorkflow.nodes?.[0], null, 2));
        console.log('✅ Successfully processed workflow');
        console.log('=== END WORKFLOW GENERATION ===');

        return NextResponse.json(processedWorkflow, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('=== WORKFLOW GENERATION ERROR ===');
        console.error('❌ Error generating workflow:', error);
        console.error('=== END ERROR ===');

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate workflow',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

/**
 * Process workflow to inject prompts and parameters
 */
function processWorkflowPrompts(workflow: Record<string, unknown>, params: {
    positivePrompt: string;
    negativePrompt?: string;
    steps?: number;
    guidance?: number;
    [key: string]: unknown;
}) {
    const { positivePrompt, negativePrompt = 'text, watermark', steps = 20, guidance = 3.5 } = params;

    // Create a deep copy to avoid modifying the original
    const processedWorkflow = JSON.parse(JSON.stringify(workflow));

    // Process each node in the workflow
    if (processedWorkflow.nodes && Array.isArray(processedWorkflow.nodes)) {
        console.log('🔄 Processing', processedWorkflow.nodes.length, 'nodes...');

        processedWorkflow.nodes.forEach((node: Record<string, unknown>) => {
            // Ensure ComfyUI compatibility: convert 'type' to 'class_type' if needed
            if (node.type && !node.class_type) {
                console.log(`🔧 Converting node ${node.id}: type "${node.type}" -> class_type`);
                node.class_type = node.type;
                delete node.type;
            } else if (!node.class_type && !node.type) {
                console.error(`❌ Node ${node.id} missing both type and class_type!`);
            }

            // Update positive prompt nodes (CLIPTextEncode nodes that seem to be for positive prompts)
            if (node.class_type === 'CLIPTextEncode' &&
                (!node.title || (typeof node.title === 'string' && (node.title.toLowerCase().includes('positif') || !node.title.toLowerCase().includes('negatif'))))) {

                // Check if this looks like a positive prompt node (longer text or no title indicating negative)
                if (node.widgets_values && Array.isArray(node.widgets_values) && node.widgets_values[0] &&
                    (typeof node.widgets_values[0] === 'string' && (node.widgets_values[0].length > 50 || !node.title))) {
                    console.log('🎯 Updating positive prompt in node', node.id);
                    node.widgets_values[0] = positivePrompt;
                }
            }

            // Update KSampler nodes with steps
            if (node.class_type === 'KSampler' && node.widgets_values && Array.isArray(node.widgets_values) && node.widgets_values.length > 2) {
                console.log('⚙️ Updating steps in KSampler node', node.id, 'from', node.widgets_values[2], 'to', steps);
                node.widgets_values[2] = steps; // Steps is usually the 3rd parameter (index 2)
            }

            // Update FluxGuidance nodes
            if (node.class_type === 'FluxGuidance' && node.widgets_values && Array.isArray(node.widgets_values) && node.widgets_values.length > 0) {
                console.log('🎯 Updating guidance in FluxGuidance node', node.id, 'from', node.widgets_values[0], 'to', guidance);
                node.widgets_values[0] = guidance;
            }

            // Handle negative prompts - look for shorter text or explicit negative indicators
            if (node.class_type === 'CLIPTextEncode' && node.widgets_values && Array.isArray(node.widgets_values) && node.widgets_values[0]) {
                const currentText = typeof node.widgets_values[0] === 'string' ? node.widgets_values[0].toLowerCase() : '';
                if (currentText.includes('text, watermark') ||
                    currentText.includes('blurry') ||
                    currentText.includes('low quality') ||
                    (node.title && typeof node.title === 'string' && node.title.toLowerCase().includes('negatif'))) {
                    console.log('🚫 Updating negative prompt in node', node.id);
                    node.widgets_values[0] = negativePrompt;
                }
            }
        });

        // Final validation: ensure ALL nodes have class_type and valid IDs
        const nodesWithoutClassType = processedWorkflow.nodes.filter((node: Record<string, unknown>) => !node.class_type);
        const nodesWithInvalidIds = processedWorkflow.nodes.filter((node: Record<string, unknown>) => !node.id || node.id === '#id' || typeof node.id === 'string' && (node.id as string).includes('#'));

        if (nodesWithoutClassType.length > 0) {
            console.error('❌ Found nodes without class_type after processing:', nodesWithoutClassType.map((n: Record<string, unknown>) => ({ id: n.id, type: n.type })));
            throw new Error(`${nodesWithoutClassType.length} nodes are missing class_type property`);
        }

        if (nodesWithInvalidIds.length > 0) {
            console.error('❌ Found nodes with invalid IDs:', nodesWithInvalidIds.map((n: Record<string, unknown>) => ({ id: n.id, class_type: n.class_type })));
            throw new Error(`${nodesWithInvalidIds.length} nodes have invalid IDs`);
        }

        console.log('✅ All', processedWorkflow.nodes.length, 'nodes have class_type property');

        // Convert from ComfyUI workflow format (with nodes array) to API format (nodes as object keys)
        const apiWorkflow: Record<string, Record<string, unknown>> = {};
        processedWorkflow.nodes.forEach((node: Record<string, unknown>) => {
            const { id, class_type, inputs, widgets_values } = node;

            // Transform to ComfyUI API format
            apiWorkflow[id as string] = {
                class_type,
                inputs: {}
            };

            // Handle node inputs (connections to other nodes)
            if (inputs && Array.isArray(inputs)) {
                (inputs as Record<string, unknown>[]).forEach((input: Record<string, unknown>) => {
                    if (input.link !== null && input.link !== undefined) {
                        // Find the source node for this connection
                        const sourceLink = (processedWorkflow.links as unknown[])?.find((link: unknown) =>
                            Array.isArray(link) && (link as unknown[])[0] === input.link
                        );
                        if (sourceLink && Array.isArray(sourceLink)) {
                            // sourceLink format: [link_id, source_node_id, source_slot, target_node_id, target_slot]
                            const sourceNodeId = sourceLink[1];
                            const sourceSlot = sourceLink[2];

                            // Get the source node to find the output name
                            const sourceNode = processedWorkflow.nodes.find((n: Record<string, unknown>) => n.id === sourceNodeId);
                            if (sourceNode && sourceNode.outputs && Array.isArray(sourceNode.outputs) && (sourceNode.outputs as unknown[])[sourceSlot as number]) {
                                (apiWorkflow[id as string].inputs as Record<string, unknown>)[input.name as string] = [sourceNodeId.toString(), sourceSlot];
                            }
                        }
                    }
                });
            }

            // Handle widgets_values (direct input values)
            if (widgets_values && Array.isArray(widgets_values)) {
                const values = widgets_values as unknown[];
                const nodeInputs = apiWorkflow[id as string].inputs as Record<string, unknown>;

                // Map widgets_values to input names based on node type and position
                if (class_type === 'CLIPTextEncode' && values.length > 0) {
                    nodeInputs.text = values[0];
                } else if (class_type === 'KSampler') {
                    // KSampler typical widgets: [seed, control_after_generate, steps, cfg, sampler_name, scheduler, denoise]
                    if (values.length > 0) nodeInputs.seed = values[0];
                    if (values.length > 2) nodeInputs.steps = values[2];
                    if (values.length > 3) nodeInputs.cfg = values[3];
                    if (values.length > 4) nodeInputs.sampler_name = values[4];
                    if (values.length > 5) nodeInputs.scheduler = values[5];
                    if (values.length > 6) nodeInputs.denoise = values[6];
                } else if (class_type === 'SaveImage' && values.length > 0) {
                    nodeInputs.filename_prefix = values[0];
                } else if (class_type === 'EmptyLatentImage' || class_type === 'EmptySD3LatentImage') {
                    if (values.length > 0) nodeInputs.width = values[0];
                    if (values.length > 1) nodeInputs.height = values[1];
                    if (values.length > 2) nodeInputs.batch_size = values[2];
                } else if (class_type === 'CheckpointLoaderSimple' && values.length > 0) {
                    nodeInputs.ckpt_name = values[0];
                } else if (class_type === 'VAELoader' && values.length > 0) {
                    nodeInputs.vae_name = values[0];
                } else if (class_type === 'UNETLoader' && values.length > 0) {
                    nodeInputs.unet_name = values[0];
                    if (values.length > 1) nodeInputs.weight_dtype = values[1];
                } else if (class_type === 'DualCLIPLoader') {
                    if (values.length > 0) nodeInputs.clip_name1 = values[0];
                    if (values.length > 1) nodeInputs.clip_name2 = values[1];
                    if (values.length > 2) nodeInputs.type = values[2];
                } else if (class_type === 'FluxGuidance' && values.length > 0) {
                    nodeInputs.guidance = values[0];
                } else {
                    // Generic handling for other node types
                    values.forEach((value: unknown, index: number) => {
                        nodeInputs[`input_${index}`] = value;
                    });
                }
            }
        });

        console.log('🔄 Converted to ComfyUI API format with', Object.keys(apiWorkflow).length, 'nodes');
        console.log('🔍 Sample API node:', JSON.stringify(Object.entries(apiWorkflow)[0], null, 2));

        return apiWorkflow;
    } else {
        console.error('❌ No nodes found in workflow!');
        throw new Error('Workflow has no nodes');
    }
}

/**
 * Handle preflight OPTIONS requests
 */
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}