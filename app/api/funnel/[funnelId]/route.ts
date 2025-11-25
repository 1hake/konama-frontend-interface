/**
 * API Route: GET /api/funnel/[funnelId]
 * 
 * Retrieves funnel state including all steps, images, and jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { funnelStorage } from '@/lib/funnelStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const { funnelId } = await params;

    // Load funnel
    const funnel = await funnelStorage.loadFunnel(funnelId);
    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Load all steps
    const steps = await funnelStorage.loadSteps(funnelId);

    // Load all images
    const images = await funnelStorage.loadImages(funnelId);

    // Load all jobs
    const jobs = await funnelStorage.loadJobs(funnelId);

    // Get current step
    const currentStep = steps.find(s => s.stepIndex === funnel.currentStepIndex) || null;

    // Get selected images
    const selectedImages = images.filter(img => img.selected);

    return NextResponse.json({
      funnel,
      currentStep,
      steps,
      images,
      selectedImages,
      jobs,
    });
  } catch (error) {
    console.error('Error loading funnel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load funnel' },
      { status: 500 }
    );
  }
}

/**
 * API Route: DELETE /api/funnel/[funnelId]
 * 
 * Deletes a funnel and all its data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const { funnelId } = await params;

    await funnelStorage.deleteFunnel(funnelId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete funnel' },
      { status: 500 }
    );
  }
}
