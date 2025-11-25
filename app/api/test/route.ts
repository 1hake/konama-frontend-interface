import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;

    return NextResponse.json({
        comfyApiUrl,
        message: 'Proxy test endpoint',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const comfyApiUrl = process.env.NEXT_PUBLIC_COMFY_API_URL;

        return NextResponse.json({
            received: 'POST request',
            comfyApiUrl,
            bodyReceived: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to parse request',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 400 });
    }
}