import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
        const body = await request.json();
        const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;

        console.log('=== PROXY REQUEST START ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('ComfyUI API URL:', comfyApiUrl);
        console.log('Request body keys:', Object.keys(body));
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

        // Forward the request to the actual ComfyUI/RunPod endpoint
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const responseTime = Date.now() - startTime;
        console.log('⏱️  Response time:', responseTime + 'ms');
        console.log('📊 RunPod response status:', response.status);
        console.log('📋 RunPod response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ RunPod API error details:');
            console.error('   Status:', response.status);
            console.error('   Status Text:', response.statusText);
            console.error('   Error Response:', errorText);
            console.log('=== PROXY REQUEST END (ERROR) ===');

            return NextResponse.json(
                {
                    error: 'RunPod API error',
                    status: response.status,
                    statusText: response.statusText,
                    message: errorText,
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
        console.log('✅ RunPod successful response:');
        console.log('   Response data:', JSON.stringify(data, null, 2));
        console.log('=== PROXY REQUEST END (SUCCESS) ===');

        // Return the response with proper CORS headers
        return NextResponse.json(data, {
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