// API route for fetching a specific workflow by name

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const WORKFLOW_API_URL = 'https://client.konama.fuzdi.fr';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        // Get authorization header from the request
        const authorization = request.headers.get('Authorization');
        
        // Get the workflow name from the URL parameter
        const { name: workflowName } = await params;

        console.log('=== WORKFLOW DETAIL REQUEST ===');
        console.log('🔄 Fetching workflow:', workflowName);
        console.log('🔑 Authorization present:', !!authorization);
        console.log('🕒 Timestamp:', new Date().toISOString());

        // Forward request to the workflow service with auth header
        const response = await axios.get(
            `${WORKFLOW_API_URL}/workflows/workflow`,
            {
                params: {
                    name: workflowName,
                },
                headers: {
                    'Content-Type': 'application/json',
                    ...(authorization && { Authorization: authorization }),
                },
            }
        );

        console.log('📊 Workflow service response status:', response.status);
        console.log('✅ Workflow fetched successfully');

        return NextResponse.json(response.data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Workflow detail proxy error:', error);

        if (axios.isAxiosError(error) && error.response) {
            const { name: workflowName } = await params;
            return NextResponse.json(
                {
                    success: false,
                    message: `Failed to fetch workflow: ${workflowName}`,
                    error: error.response.data,
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: 'Failed to fetch workflow details',
            },
            { status: 500 }
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
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
