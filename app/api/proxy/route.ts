import { NextRequest, NextResponse } from 'next/server';

// Check if a node provides essential model loading
function isEssentialModelNode(node: any): boolean {
    const essentialTypes = ['CheckpointLoaderSimple', 'UNETLoader', 'DualCLIPLoader', 'VAELoader'];
    return essentialTypes.includes(node.class_type);
}

// Find alternative model connections when a node is removed
function findModelAlternative(fixedPrompt: any, removedNodeId: string, outputType: string): string | null {
    // Look for other nodes that can provide the same model type
    for (const [nodeId, node] of Object.entries(fixedPrompt)) {
        if (!node || typeof node !== 'object') continue;

        // Check if this node can provide the required output type
        const nodeData = node as any;
        if (nodeData.class_type === 'UNETLoader' && outputType === 'MODEL') return nodeId;
        if (nodeData.class_type === 'DualCLIPLoader' && outputType === 'CLIP') return nodeId;
        if (nodeData.class_type === 'VAELoader' && outputType === 'VAE') return nodeId;
        if (nodeData.class_type === 'CheckpointLoaderSimple') {
            // Checkpoint loader provides MODEL, CLIP, and VAE
            if (outputType === 'MODEL' || outputType === 'CLIP' || outputType === 'VAE') {
                const outputIndex = outputType === 'MODEL' ? 0 : outputType === 'CLIP' ? 1 : 2;
                return `${nodeId}:${outputIndex}`;
            }
        }
    }
    return null;
}

// Fallback minimal Flux workflow
function getMinimalFluxWorkflow(prompt?: string): any {
    return {
        "6": {
            "inputs": {
                "text": prompt || "a beautiful landscape",
                "clip": ["11", 0]
            },
            "class_type": "CLIPTextEncode"
        },
        "8": {
            "inputs": {
                "samples": ["13", 0],
                "vae": ["10", 0]
            },
            "class_type": "VAEDecode"
        },
        "9": {
            "inputs": {
                "filename_prefix": "fallback_generation",
                "images": ["8", 0]
            },
            "class_type": "SaveImage"
        },
        "10": {
            "inputs": {
                "vae_name": "ae.safetensors"
            },
            "class_type": "VAELoader"
        },
        "11": {
            "inputs": {
                "clip_name1": "clip_l.safetensors",
                "clip_name2": "t5xxl_fp16.safetensors",
                "type": "flux",
                "device": "default"
            },
            "class_type": "DualCLIPLoader"
        },
        "12": {
            "inputs": {
                "unet_name": "flux1-dev.sft",
                "weight_dtype": "default"
            },
            "class_type": "UNETLoader"
        },
        "13": {
            "inputs": {
                "seed": Math.floor(Math.random() * 1000000),
                "steps": 20,
                "cfg": 1.0,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["12", 0],
                "positive": ["27", 0],
                "negative": ["16", 0],
                "latent_image": ["5", 0]
            },
            "class_type": "KSampler"
        },
        "5": {
            "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage"
        },
        "16": {
            "inputs": {
                "conditioning": ["6", 0]
            },
            "class_type": "ConditioningZeroOut"
        },
        "27": {
            "inputs": {
                "guidance": 3.5,
                "conditioning": ["6", 0]
            },
            "class_type": "FluxGuidance"
        }
    };
}

// Workflow validation and fixing utilities
function validateAndFixWorkflow(prompt: any): { prompt: any; warnings: string[] } {
    const warnings: string[] = [];

    if (!prompt || typeof prompt !== 'object') {
        return { prompt, warnings };
    }

    const fixedPrompt = { ...prompt };
    const nodesToRemove: string[] = [];

    // Iterate through all nodes in the prompt
    Object.keys(fixedPrompt).forEach(nodeId => {
        const node = fixedPrompt[nodeId];

        if (!node || typeof node !== 'object') return;

        // Ensure class_type exists
        if (!node.class_type) {
            warnings.push(`Node ${nodeId}: Missing class_type - node will be skipped`);
            // Don't process this node further as we can't determine its type
            return;
        }

        // Ensure inputs object exists
        if (!node.inputs) {
            node.inputs = {};
            warnings.push(`Node ${nodeId}: Added missing inputs object`);
        }

        // Fix common missing parameters based on node type
        switch (node.class_type) {
            case 'UNETLoader':
                if (!node.inputs.weight_dtype) {
                    node.inputs.weight_dtype = 'default';
                    warnings.push(`Node ${nodeId}: Added default weight_dtype`);
                }
                break;

            case 'DualCLIPLoader':
                if (!node.inputs.device) {
                    node.inputs.device = 'default';
                    warnings.push(`Node ${nodeId}: Added default device`);
                }
                break;

            case 'KSampler':
                // Ensure all required KSampler inputs are present
                const kSamplerDefaults = {
                    seed: Math.floor(Math.random() * 1000000),
                    steps: 20,
                    cfg: 1.0, // Default for Flux
                    sampler_name: 'euler',
                    scheduler: 'simple',
                    denoise: 1.0
                };

                Object.entries(kSamplerDefaults).forEach(([key, defaultValue]) => {
                    if (node.inputs[key] === undefined) {
                        node.inputs[key] = defaultValue;
                        warnings.push(`Node ${nodeId}: Added default ${key}: ${defaultValue}`);
                    }
                });
                break;

            case 'FluxResolutionNode':
                // FluxResolutionNode is often problematic due to aspect ratio validation
                // Mark it for removal and we'll handle connections later
                nodesToRemove.push(nodeId);
                warnings.push(`Node ${nodeId}: Marked FluxResolutionNode for removal due to validation issues`);
                break;

            case 'UltimateSDUpscale':
                // UltimateSDUpscale is complex and often causes issues
                nodesToRemove.push(nodeId);
                warnings.push(`Node ${nodeId}: Marked UltimateSDUpscale for removal (complex upscaling node)`);
                break;

            case 'ControlNetLoader':
            case 'ControlNetApply':
                // ControlNet nodes depend on specific models
                nodesToRemove.push(nodeId);
                warnings.push(`Node ${nodeId}: Marked ControlNet node for removal (ControlNet models are system-specific)`);
                break;

            case 'UpscaleModelLoader':
                // Always mark upscale nodes for removal - they're optional and upscale models vary by system
                nodesToRemove.push(nodeId);
                warnings.push(`Node ${nodeId}: Marked UpscaleModelLoader for removal (upscale models are system-specific)`);
                break;

            case 'LoraLoaderModelOnly':
                if (!node.inputs.strength_model) {
                    node.inputs.strength_model = 1.0;
                    warnings.push(`Node ${nodeId}: Added default strength_model: 1.0`);
                }
                // Always mark LoRA nodes for removal - they're optional and often cause issues
                // We can't know which LoRA files exist on external systems
                nodesToRemove.push(nodeId);
                warnings.push(`Node ${nodeId}: Marked LoraLoaderModelOnly for removal (LoRA files are system-specific)`);
                break;

            case 'UltimateSDUpscale':
                // This node has many required inputs - add defaults for common ones
                const upscaleDefaults = {
                    upscale_by: 2.0,
                    seed: Math.floor(Math.random() * 1000000),
                    steps: 20,
                    cfg: 1.0,
                    sampler_name: 'euler',
                    scheduler: 'simple',
                    denoise: 0.1,
                    mode_type: 'Linear',
                    tile_width: 512,
                    tile_height: 512,
                    mask_blur: 8,
                    tile_padding: 32,
                    seam_fix_mode: 'None',
                    seam_fix_denoise: 1.0,
                    seam_fix_width: 64,
                    seam_fix_mask_blur: 8,
                    seam_fix_padding: 16,
                    force_uniform_tiles: true,
                    tiled_decode: false
                };

                Object.entries(upscaleDefaults).forEach(([key, defaultValue]) => {
                    if (node.inputs[key] === undefined) {
                        node.inputs[key] = defaultValue;
                        warnings.push(`Node ${nodeId}: Added default ${key}: ${defaultValue}`);
                    }
                });
                break;
        }

        // Validate node connections (inputs that reference other nodes)
        Object.entries(node.inputs).forEach(([inputName, inputValue]) => {
            if (Array.isArray(inputValue) && inputValue.length === 2) {
                const [referencedNodeId] = inputValue;
                if (typeof referencedNodeId === 'string' && !fixedPrompt[referencedNodeId]) {
                    warnings.push(`Node ${nodeId}: Input '${inputName}' references missing node '${referencedNodeId}'`);
                }
            }
        });
    });

    // Remove problematic nodes if any were marked for removal
    nodesToRemove.forEach(nodeId => {
        delete fixedPrompt[nodeId];
        warnings.push(`Removed problematic node ${nodeId}`);
    });

    // Fix connections to removed nodes by updating references
    if (nodesToRemove.length > 0) {
        Object.keys(fixedPrompt).forEach(nodeId => {
            const node = fixedPrompt[nodeId];
            if (!node || !node.inputs) return;

            Object.entries(node.inputs).forEach(([inputName, inputValue]) => {
                if (Array.isArray(inputValue) && inputValue.length === 2) {
                    const [referencedNodeId, outputIndex] = inputValue;
                    if (nodesToRemove.includes(referencedNodeId)) {

                        // Handle specific cases for dimension inputs
                        if (inputName === 'width' || inputName === 'height') {
                            const defaultValue = inputName === 'width' ? 1024 : 1024;
                            node.inputs[inputName] = defaultValue;
                            warnings.push(`Node ${nodeId}: Replaced ${inputName} connection with fixed value ${defaultValue}`);
                        }
                        // Handle model connections - try to find alternatives
                        else if (inputName === 'model' || inputName === 'clip' || inputName === 'vae') {
                            const outputType = inputName.toUpperCase();
                            const alternative = findModelAlternative(fixedPrompt, referencedNodeId, outputType);

                            if (alternative) {
                                const [altNodeId, altIndex] = alternative.includes(':')
                                    ? alternative.split(':')
                                    : [alternative, outputIndex];
                                node.inputs[inputName] = [altNodeId, parseInt(altIndex) || outputIndex];
                                warnings.push(`Node ${nodeId}: Redirected ${inputName} connection to alternative node ${altNodeId}`);
                            } else {
                                warnings.push(`Node ${nodeId}: Removed ${inputName} connection - no alternative found`);
                                delete node.inputs[inputName];
                            }
                        }
                        // For LoRA connections (like strength inputs), just remove them
                        else if (inputName.includes('lora') || inputName.includes('strength')) {
                            warnings.push(`Node ${nodeId}: Removed LoRA connection ${inputName}`);
                            delete node.inputs[inputName];
                        }
                        // For other connections, remove the input
                        else {
                            warnings.push(`Node ${nodeId}: Removed connection ${inputName} to deleted node ${referencedNodeId}`);
                            delete node.inputs[inputName];
                        }
                    }
                }
            });
        });
    }

    return { prompt: fixedPrompt, warnings };
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
        const body = await request.json();
        console.log("🚀 ~ POST ~ body:", body)
        const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;
        console.log("🚀 ComfyUI API URL:", comfyApiUrl)

        console.log('=== PROXY REQUEST START ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('ComfyUI API URL:', comfyApiUrl);
        console.log('Request body keys:', Object.keys(body));

        // Validate and fix workflow
        let processedBody = { ...body };
        let warnings: string[] = [];

        if (body.prompt && typeof body.prompt === 'object') {
            const { prompt: fixedPrompt, warnings: validationWarnings } = validateAndFixWorkflow(body.prompt);
            processedBody.prompt = fixedPrompt;
            warnings = validationWarnings;

            if (warnings.length > 0) {
                console.log('⚠️  Workflow fixes applied:');
                warnings.forEach(warning => console.log(`   - ${warning}`));
            }

            // Log workflow structure
            const workflow = processedBody.prompt;
            console.log('📊 Workflow structure:');
            console.log('  - Node count:', Object.keys(workflow).length);

            // Show node summary
            const nodeTypes = Object.values(workflow)
                .filter((node: any) => node && typeof node === 'object' && node.class_type)
                .map((node: any) => node.class_type);
            console.log('  - Node types:', [...new Set(nodeTypes)].join(', '));
        }

        console.log('Processed request body keys:', Object.keys(processedBody));

        if (!comfyApiUrl) {
            console.error('❌ ComfyUI API URL not configured');
            return NextResponse.json(
                { error: 'ComfyUI API URL not configured' },
                { status: 500 }
            );
        }

        const targetUrl = `${comfyApiUrl}/prompt`;
        console.log('🔄 Forwarding request to:', targetUrl);

        // Forward the processed request to the actual ComfyUI/RunPod endpoint
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processedBody),
        });

        const responseTime = Date.now() - startTime;
        console.log('⏱️  Response time:', responseTime + 'ms');
        console.log('📊 ComfyUI response status:', response.status);
        console.log('📋 ComfyUI response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ ComfyUI API error details:');
            console.error('   Status:', response.status);
            console.error('   Status Text:', response.statusText);
            console.error('   Error Response:', errorText);

            // Try to parse the error to provide better feedback
            let parsedError;
            try {
                parsedError = JSON.parse(errorText);
            } catch {
                parsedError = { message: errorText };
            }

            // Check if this is a file-not-found error that we can fix
            let canRetryWithFix = false;
            let additionalFixes: string[] = [];

            if (parsedError.error?.type === 'prompt_outputs_failed_validation' && parsedError.node_errors) {
                const nodeErrors = parsedError.node_errors as Record<string, any>;

                // Look for "not in list" errors (missing files)
                Object.entries(nodeErrors).forEach(([nodeId, nodeError]) => {
                    const errors = nodeError.errors || [];
                    const hasFileError = errors.some((err: any) =>
                        err.type === 'value_not_in_list' &&
                        (err.details?.includes('not in []') || err.details?.includes('not in ('))
                    );

                    if (hasFileError && processedBody.prompt && processedBody.prompt[nodeId]) {
                        // Remove this problematic node
                        delete processedBody.prompt[nodeId];
                        additionalFixes.push(`Removed node ${nodeId} (${nodeError.class_type}) due to missing file`);
                        canRetryWithFix = true;

                        // Fix any connections to this removed node
                        Object.values(processedBody.prompt).forEach((node: any) => {
                            if (node && node.inputs) {
                                Object.entries(node.inputs).forEach(([inputName, inputValue]) => {
                                    if (Array.isArray(inputValue) && inputValue[0] === nodeId) {
                                        delete node.inputs[inputName];
                                        additionalFixes.push(`Removed connection to deleted node ${nodeId}`);
                                    }
                                });
                            }
                        });
                    }
                });
            }

            // If we can fix the issues, retry the request
            if (canRetryWithFix) {
                console.log('🔄 Retrying with additional fixes:', additionalFixes);

                const retryResponse = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processedBody),
                });

                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    console.log('✅ Retry successful after additional fixes');

                    return NextResponse.json({
                        ...retryData,
                        _metadata: {
                            appliedFixes: [...warnings, ...additionalFixes],
                            fixCount: warnings.length + additionalFixes.length,
                            retried: true
                        }
                    }, {
                        status: retryResponse.status,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'POST, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type',
                        },
                    });
                }
            }

            // Extract useful information from workflow validation errors
            let errorSummary = 'ComfyUI API error';
            let suggestions: string[] = [];

            if (parsedError.error?.type === 'prompt_outputs_failed_validation') {
                errorSummary = 'Workflow validation failed';

                if (parsedError.node_errors) {
                    const nodeErrors = Object.entries(parsedError.node_errors as Record<string, any>);
                    suggestions.push(`Found ${nodeErrors.length} nodes with issues:`);

                    nodeErrors.slice(0, 5).forEach(([nodeId, nodeError]: [string, any]) => {
                        if (nodeError.class_type) {
                            suggestions.push(`- Node ${nodeId} (${nodeError.class_type}): ${nodeError.errors?.[0]?.details || 'Unknown error'}`);
                        }
                    });

                    if (nodeErrors.length > 5) {
                        suggestions.push(`... and ${nodeErrors.length - 5} more nodes`);
                    }
                }
            }

            console.log('=== PROXY REQUEST END (ERROR) ===');

            return NextResponse.json(
                {
                    error: errorSummary,
                    status: response.status,
                    statusText: response.statusText,
                    message: errorText,
                    suggestions,
                    appliedFixes: warnings,
                    timestamp: new Date().toISOString(),
                    responseTime: responseTime
                },
                {
                    status: response.status,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                }
            );
        }

        const data = await response.json();
        console.log('✅ ComfyUI successful response:');
        console.log('   Response data:', JSON.stringify(data, null, 2));

        if (warnings.length > 0) {
            console.log('✨ Workflow was automatically fixed');
        }

        console.log('=== PROXY REQUEST END (SUCCESS) ===');

        // Add applied fixes to the response if any were made
        const enhancedData = warnings.length > 0
            ? {
                ...data,
                _metadata: {
                    appliedFixes: warnings,
                    fixCount: warnings.length
                }
            }
            : data;

        // Return the response with proper CORS headers
        return NextResponse.json(enhancedData, {
            status: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy request', details: error instanceof Error ? error.message : String(error) },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        );
    }
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}