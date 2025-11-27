import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        const type = searchParams.get('type');
        const subfolder = searchParams.get('subfolder');
        const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;

        if (!comfyApiUrl || !filename || !type) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Construct the view URL for the RunPod endpoint
        const viewParams = new URLSearchParams({
            filename,
            type,
            ...(subfolder && { subfolder }),
        });

        // Forward the request to the actual ComfyUI/RunPod endpoint
        const response = await axios.get(
            `${comfyApiUrl}/view?${viewParams.toString()}`,
            {
                responseType: 'arraybuffer',
            }
        );

        // Get the image data
        const imageBuffer = response.data;
        const contentType = response.headers['content-type'] || 'image/png';

        // Return the image with proper headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('View proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy image request' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
