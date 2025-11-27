/**
 * API Route: POST /api/funnel/[funnelId]/step/[stepId]/select
 *
 * Marks images as selected in a step
 */

import { NextRequest, NextResponse } from 'next/server';
import { SelectImagesRequest } from '@/types/funnel';
import { funnelStorage } from '@/lib/funnelStorage';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ funnelId: string; stepId: string }> }
) {
    try {
        const { funnelId, stepId } = await params;
        const body: SelectImagesRequest = await request.json();

        if (!body.imageIds || !Array.isArray(body.imageIds)) {
            return NextResponse.json(
                { error: 'imageIds must be an array' },
                { status: 400 }
            );
        }

        // Load step
        const step = await funnelStorage.loadStep(funnelId, stepId);
        if (!step) {
            return NextResponse.json(
                { error: 'Step not found' },
                { status: 404 }
            );
        }

        // Load all images for this step
        const images = await funnelStorage.loadImages(funnelId, stepId);

        // Update selection status
        const selectedIds = new Set(body.imageIds);
        for (const image of images) {
            image.selected = selectedIds.has(image.id);
            await funnelStorage.saveImage(image);
        }

        // Update step
        step.selectedCount = body.imageIds.length;
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        await funnelStorage.saveStep(step);

        // Update funnel
        const funnel = await funnelStorage.loadFunnel(funnelId);
        if (funnel) {
            funnel.updatedAt = new Date().toISOString();
            await funnelStorage.saveFunnel(funnel);
        }

        const selectedImages = images.filter(img => img.selected);

        return NextResponse.json({
            step,
            selectedImages,
        });
    } catch (error) {
        console.error('Error selecting images:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to select images',
            },
            { status: 500 }
        );
    }
}
