import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * GET /api/workflows - Proxy to external workflow service
 */
export async function GET() {
    try {
        const response = await fetch(`${config.workflowApiUrl}/workflows`);

        if (!response.ok) {
            throw new Error(`External service returned ${response.status}: ${response.statusText}`);
        }

        const workflows = await response.json();

        return NextResponse.json(workflows, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Error fetching workflows:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch workflows',
                details: error instanceof Error ? error.message : String(error)
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
