/**
 * API Route: GET /api/funnel/list
 * 
 * Lists all funnels
 */

import { NextRequest, NextResponse } from 'next/server';
import { funnelStorage } from '@/lib/funnelStorage';

export async function GET(request: NextRequest) {
  try {
    const funnels = await funnelStorage.listFunnels();

    return NextResponse.json({ funnels });
  } catch (error) {
    console.error('Error listing funnels:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list funnels' },
      { status: 500 }
    );
  }
}
