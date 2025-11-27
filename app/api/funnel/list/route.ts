/**
 * API Route: GET /api/funnel/list
 *
 * Lists all funnels
 */

import { NextResponse } from 'next/server';
import { funnelStorage } from '@/lib/funnelStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const funnels = await funnelStorage.listFunnels();

        return NextResponse.json({ funnels });
    } catch (error) {
        console.error('Error listing funnels:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to list funnels',
            },
            { status: 500 }
        );
    }
}
