import { NextRequest, NextResponse } from 'next/server';
import { workflowManager } from '../../../lib/workflowManager';

/**
 * GET /api/workflows - Get all available workflows
 */
export async function GET(request: NextRequest) {
    try {
        const workflows = workflowManager.getAvailableWorkflows();

        return NextResponse.json({
            success: true,
            workflows,
            count: workflows.length
        }, {
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
