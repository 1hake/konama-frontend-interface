/**
 * API Route: POST /api/funnel/[funnelId]/step/create
 * 
 * Creates a new step with refinements based on selected images
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateNextStepRequest, FunnelStep } from '@/types/funnel';
import { funnelStorage } from '@/lib/funnelStorage';
import { generationQueue } from '@/lib/generationQueue';

export async function POST(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  try {
    const { funnelId } = params;
    const body: CreateNextStepRequest = await request.json();

    if (!body.selectedImageIds || body.selectedImageIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one image must be selected' },
        { status: 400 }
      );
    }

    // Load funnel
    const funnel = await funnelStorage.loadFunnel(funnelId);
    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Load selected images
    const selectedImages = await Promise.all(
      body.selectedImageIds.map(id => funnelStorage.loadImage(funnelId, id))
    );

    const validImages = selectedImages.filter(img => img !== null);
    if (validImages.length === 0) {
      return NextResponse.json(
        { error: 'No valid images found' },
        { status: 404 }
      );
    }

    // Get current step to use as parent
    const currentStep = await funnelStorage.loadStep(
      funnelId,
      validImages[0]!.stepId
    );

    // Create new step
    const stepIndex = funnel.currentStepIndex + 1;
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newStep: FunnelStep = {
      id: stepId,
      funnelId,
      stepIndex,
      status: 'generating',
      createdAt: now,
      parentStepId: currentStep?.id,
      imageCount: 0,
      selectedCount: 0,
      // Store the prompt and technical fields from the request
      promptFields: body.promptFields,
      technicalParameters: body.technicalParameters,
    };

    // Save new step
    await funnelStorage.saveStep(newStep);

    // Update funnel
    funnel.steps.push(newStep);
    funnel.currentStepIndex = stepIndex;
    funnel.updatedAt = now;
    await funnelStorage.saveFunnel(funnel);

    // Build refinements from selected images
    const refinementMap = new Map(
      (body.refinements || []).map(r => [r.imageId, r])
    );

    const refinements = validImages.map(image => {
      const refinement = refinementMap.get(image!.id);
      return {
        parentImageId: image!.id,
        workflowId: refinement?.workflowId || image!.workflowId,
        prompt: refinement?.prompt || image!.prompt,
        negativePrompt: refinement?.negativePrompt || image!.negativePrompt,
        parameters: {
          ...image!.parameters,
          ...(refinement?.parameters || {}),
        },
      };
    });

    // Execute refinements in parallel
    const { jobs, images } = await generationQueue.executeRefinements(
      funnelId,
      stepId,
      refinements
    );

    // Update step with results
    newStep.imageCount = images.length;
    newStep.status = 'selecting';
    await funnelStorage.saveStep(newStep);

    // Update funnel
    funnel.updatedAt = new Date().toISOString();
    await funnelStorage.saveFunnel(funnel);

    return NextResponse.json({
      funnel,
      step: newStep,
      images,
      jobs: jobs.map(job => ({
        id: job.id,
        workflowId: job.workflowId,
        status: job.status,
      })),
    });
  } catch (error) {
    console.error('Error creating next step:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create next step' },
      { status: 500 }
    );
  }
}
