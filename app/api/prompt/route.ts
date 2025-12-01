import { NextRequest, NextResponse } from 'next/server';
import { generateWorkflow } from '@/lib/workflowTemplate';
import { generateWorkflowJson } from '@/lib/workflowManager';
import axios from 'axios';

export const dynamic = 'force-dynamic';

/**
 * POST /api/prompt - Generate an image using a workflow template and prompt
 * This mimics the curl example: sends a workflow with prompt to ComfyUI
 * 
 * Body should contain:
 * {
 *   "workflowId": "flux-krea-dev",
 *   "prompt": "a beautiful landscape",
 *   "negativePrompt": "blurry, low quality", // optional
 *   "steps": 20, // optional
 *   "guidance": 3.5, // optional
 *   ... other parameters
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workflowId, prompt: positivePrompt, negativePrompt, ...options } = body;

        console.log('=== PROMPT API REQUEST ===');
        console.log('🆔 Workflow ID:', workflowId);
        console.log('📝 Positive Prompt:', positivePrompt);
        console.log('📝 Negative Prompt:', negativePrompt);
        console.log('⚙️ Options:', options);

        if (!workflowId) {
            return NextResponse.json(
                { error: 'workflowId is required' },
                { status: 400 }
            );
        }

        if (!positivePrompt) {
            return NextResponse.json(
                { error: 'prompt is required' },
                { status: 400 }
            );
        }

        // Generate the workflow using the new workflow manager if workflowId is provided
        let workflowPayload;
        
        try {
            // Try the new workflow manager first (handles both API and local workflows)
            console.log('🔄 Using workflow manager for:', workflowId);
            const workflowJson = await generateWorkflowJson(
                workflowId,
                positivePrompt,
                negativePrompt,
                options
            );
            
            workflowPayload = {
                prompt: workflowJson,
                client_id: `client-${Date.now()}`,
            };
            
            console.log('✅ Generated workflow using workflow manager');
            
        } catch (managerError) {
            console.warn('⚠️ Workflow manager failed, trying legacy system:', managerError);
            
            // Fallback to legacy template system
            workflowPayload = generateWorkflow(workflowId, {
                positivePrompt,
                negativePrompt,
                ...options
            });
            
            if (!workflowPayload) {
                console.error('❌ Both workflow systems failed');
                return NextResponse.json(
                    { error: `Failed to generate workflow for ${workflowId}` },
                    { status: 400 }
                );
            }
            
            console.log('✅ Generated workflow using legacy system');
        }

        console.log('✅ Generated workflow payload');
        console.log('📊 Workflow structure:', workflowPayload.prompt ? 'New format' : 'Legacy format');

        // Get ComfyUI API URL
        const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;
        if (!comfyApiUrl) {
            console.error('❌ ComfyUI API URL not configured');
            return NextResponse.json(
                { error: 'ComfyUI API URL not configured' },
                { status: 500 }
            );
        }

        // Send the workflow to ComfyUI
        const targetUrl = `${comfyApiUrl}/prompt`;
        console.log('🚀 Sending workflow to ComfyUI:', targetUrl);

        const response = await axios.post(targetUrl, workflowPayload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('✅ ComfyUI responded successfully');
        console.log('📋 Response:', response.data);
        console.log('=== END PROMPT API ===');

        return NextResponse.json(response.data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('=== PROMPT API ERROR ===');
        console.error('❌ Error:', error);
        console.error('=== END ERROR ===');

        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(
                {
                    error: 'ComfyUI API error',
                    status: error.response.status,
                    message: error.response.data,
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to generate image',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
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