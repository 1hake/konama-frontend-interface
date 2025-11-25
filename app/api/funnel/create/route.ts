/**
 * API Route: POST /api/funnel/create
 * 
 * Creates a new funnel and generates the initial step with parallel workflow execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateFunnelRequest, Funnel, FunnelStep } from '@/types/funnel';
import { funnelStorage } from '@/lib/funnelStorage';
import { generationQueue } from '@/lib/generationQueue';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: CreateFunnelRequest = await request.json();

    // Validate request
    if (!body.name || !body.config) {
      return NextResponse.json(
        { error: 'Missing required fields: name, config' },
        { status: 400 }
      );
    }

    if (!body.config.selectedWorkflows || body.config.selectedWorkflows.length === 0) {
      return NextResponse.json(
        { error: 'At least one workflow must be selected' },
        { status: 400 }
      );
    }

    if (!body.config.basePrompt) {
      return NextResponse.json(
        { error: 'Base prompt is required' },
        { status: 400 }
      );
    }

    // Create funnel
    const funnelId = `funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const funnel: Funnel = {
      id: funnelId,
      name: body.name,
      description: body.description,
      config: body.config,
      steps: [],
      currentStepIndex: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    // Create initial step
    const stepId = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const step: FunnelStep = {
      id: stepId,
      funnelId,
      stepIndex: 0,
      status: 'generating',
      createdAt: now,
      imageCount: 0,
      selectedCount: 0,
      // Store the prompt and technical fields from the request
      promptFields: body.config.baseParameters?.promptFields,
      technicalParameters: body.config.baseParameters?.technicalParameters,
    };

    funnel.steps = [step];

    // Save funnel and step
    await funnelStorage.saveFunnel(funnel);
    await funnelStorage.saveStep(step);

    // Start parallel generation for all workflows
    const { jobs, images } = await generationQueue.executeParallel(
      funnelId,
      stepId,
      body.config.selectedWorkflows,
      body.config.basePrompt,
      body.config.baseNegativePrompt,
      body.config.baseParameters || {}
    );

    // Update step with image count
    step.imageCount = images.length;
    step.status = 'selecting';
    await funnelStorage.saveStep(step);

    // Update funnel
    funnel.updatedAt = new Date().toISOString();
    await funnelStorage.saveFunnel(funnel);

    return NextResponse.json({
      funnel,
      step,
      images,
      jobs: jobs.map(job => ({
        id: job.id,
        workflowId: job.workflowId,
        status: job.status,
      })),
    });
  } catch (error) {
    console.error('Error creating funnel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create funnel' },
      { status: 500 }
    );
  }
}
