import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
        const body = await request.json();
        console.log('🚀 ~ POST ~ body:', body);
        const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;
        console.log('🚀 ComfyUI API URL:', comfyApiUrl);

        console.log('=== PROXY REQUEST START ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('ComfyUI API URL:', comfyApiUrl);
        console.log('Request body keys:', Object.keys(body));

        // Detailed workflow validation
        if (body.prompt && typeof body.prompt === 'object') {
            const workflow = body.prompt;
            console.log('📊 Workflow structure:');
            console.log('  - Has nodes:', !!workflow.nodes);
            console.log('  - Nodes count:', workflow.nodes?.length || 0);

            if (workflow.nodes && Array.isArray(workflow.nodes)) {
                // Check for nodes without class_type
                const nodesWithoutClassType = workflow.nodes.filter(
                    (node: Record<string, unknown>) => !node.class_type
                );
                console.log(
                    '  - Nodes without class_type:',
                    nodesWithoutClassType.length
                );

                if (nodesWithoutClassType.length > 0) {
                    console.error('❌ PROBLEM NODES WITHOUT CLASS_TYPE:');
                    nodesWithoutClassType.forEach(
                        (node: Record<string, unknown>) => {
                            console.error(
                                `    Node ID: ${node.id}, type: ${node.type}, class_type: ${node.class_type}`
                            );
                        }
                    );
                }

                // Show first few nodes for debugging
                console.log('  - First 3 nodes:');
                workflow.nodes
                    .slice(0, 3)
                    .forEach((node: Record<string, unknown>, i: number) => {
                        console.log(
                            `    ${i}: id=${node.id}, class_type=${node.class_type}, type=${node.type}`
                        );
                    });
            }
        }

        console.log('Full request body:', JSON.stringify(body, null, 2));

        if (!comfyApiUrl) {
            console.error('❌ ComfyUI API URL not configured');
            return NextResponse.json(
                { error: 'ComfyUI API URL not configured' },
                { status: 500 }
            );
        }

        const targetUrl = `${comfyApiUrl}/prompt`;
        console.log('🔄 Forwarding request to:', targetUrl);

        // Forward the request to the actual ComfyUI/RunPod endpoint using axios
        const response = await axios.post(targetUrl, body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseTime = Date.now() - startTime;
        console.log('⏱️  Response time:', responseTime + 'ms');
        console.log('📊 ComfyUI response status:', response.status);
        console.log('📋 ComfyUI response headers:', response.headers);

        console.log('✅ ComfyUI successful response:');
        console.log(
            '   Response data:',
            JSON.stringify(response.data, null, 2)
        );
        console.log('=== PROXY REQUEST END (SUCCESS) ===');

        // Return the response with proper CORS headers
        return NextResponse.json(response.data, {
            status: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('Proxy error:', error);

        if (axios.isAxiosError(error) && error.response) {
            console.error('❌ ComfyUI API error details:');
            console.error('   Status:', error.response.status);
            console.error('   Status Text:', error.response.statusText);
            console.error('   Error Response:', error.response.data);
            console.log('=== PROXY REQUEST END (ERROR) ===');

            return NextResponse.json(
                {
                    error: 'ComfyUI API error',
                    status: error.response.status,
                    statusText: error.response.statusText,
                    message: error.response.data,
                    timestamp: new Date().toISOString(),
                    responseTime: responseTime,
                },
                {
                    status: error.response.status,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to proxy request',
                details: error instanceof Error ? error.message : String(error),
            },
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
