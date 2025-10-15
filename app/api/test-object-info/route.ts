import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../lib/config';

/**
 * GET /api/test-object-info - Test connection to ComfyUI and inspect object_info structure
 */
export async function GET(request: NextRequest) {
    try {
        const comfyApiUrl = config.comfyApiUrl;

        if (!comfyApiUrl) {
            return NextResponse.json({
                success: false,
                error: 'ComfyUI API URL not configured',
                config: process.env.NEXT_PUBLIC_COMFY_API_URL
            }, { status: 400 });
        }

        console.log('🔍 Testing connection to ComfyUI via proxy');

        // Use the proxy endpoint to avoid CORS issues
        const response = await fetch(`${request.nextUrl.origin}/api/object-info`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({
                success: false,
                error: `Failed to fetch object info via proxy: ${response.status} ${response.statusText}`,
                comfyApiUrl,
                responseStatus: response.status,
                responseStatusText: response.statusText,
                proxyError: errorData
            }, { status: response.status });
        }

        const objectInfo = await response.json();
        const nodeNames = Object.keys(objectInfo);

        // Analyze the structure
        const analysis = {
            totalNodes: nodeNames.length,
            hasFluxNodes: nodeNames.some(node => node.toLowerCase().includes('flux')),
            hasKSampler: nodeNames.includes('KSampler'),
            hasCheckpointLoader: nodeNames.includes('CheckpointLoaderSimple'),
            hasCLIPTextEncode: nodeNames.includes('CLIPTextEncode'),
            sampleNodeNames: nodeNames.slice(0, 20), // First 20 nodes
            hasWorkflowsProperty: objectInfo.hasOwnProperty('workflows'),
            fluxRelatedNodes: nodeNames.filter(node => node.toLowerCase().includes('flux')),
        };

        return NextResponse.json({
            success: true,
            comfyApiUrl,
            analysis,
            // Include first few nodes for inspection
            sampleNodes: Object.fromEntries(
                nodeNames.slice(0, 3).map(name => [name, objectInfo[name]])
            )
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('❌ Error testing object info:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to connect to ComfyUI',
            details: error instanceof Error ? error.message : String(error),
            comfyApiUrl: config.comfyApiUrl
        }, { status: 500 });
    }
}

/**
 * Handle preflight OPTIONS requests
 */
export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}