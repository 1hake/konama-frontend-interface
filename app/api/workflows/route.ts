// API route for workflows proxy

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const WORKFLOW_API_URL = 'https://client.konama.fuzdi.fr';

export async function GET(request: NextRequest) {
    try {
        // Get authorization header from the request
        const authorization = request.headers.get('Authorization');

        console.log('=== WORKFLOWS REQUEST ===');
        console.log('🔄 Fetching workflows from:', WORKFLOW_API_URL);
        console.log('🔑 Authorization present:', !!authorization);
        console.log('🕒 Timestamp:', new Date().toISOString());

        // Forward request to the workflow service with auth header
        const response = await axios.get(`${WORKFLOW_API_URL}/workflows`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authorization && { Authorization: authorization }),
            },
        });

        console.log('📊 Workflow service response status:', response.status);
        console.log('✅ Workflows fetched successfully');

        return NextResponse.json(response.data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Workflows proxy error:', error);

        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to fetch workflows',
                    error: error.response.data,
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: 'Failed to fetch workflows',
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
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
