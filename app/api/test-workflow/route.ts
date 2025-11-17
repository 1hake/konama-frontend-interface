import { NextRequest, NextResponse } from 'next/server';
import { validateWorkflowStructure } from '@/lib/workflowTestUtils';
import { processWorkflow } from '@/lib/workflowConverter';
import normalWorkflow from '../proxy/example-normal.json';
import apiWorkflow from '../proxy/example-api.json';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running workflow conversion test...');

    // Test conversion with built-in example files
    const convertedWorkflow = processWorkflow(normalWorkflow);

    if (!convertedWorkflow) {
      return NextResponse.json({
        success: false,
        message: 'Workflow conversion test failed',
        timestamp: new Date().toISOString()
      });
    }

    const expectedNodes = Object.keys(apiWorkflow).length;
    const convertedNodes = Object.keys(convertedWorkflow).length;

    // Check if key nodes are present
    const keyNodes = ['31', '38', '39', '40', '45', '8', '9'];
    const presentNodes = keyNodes.filter(nodeId =>
      (apiWorkflow as any)[nodeId] && convertedWorkflow[nodeId]
    );

    return NextResponse.json({
      success: true,
      message: 'Workflow conversion test completed',
      results: {
        expectedNodes,
        convertedNodes,
        keyNodesPresent: presentNodes.length,
        totalKeyNodes: keyNodes.length,
        conversionRate: `${Math.round((presentNodes.length / keyNodes.length) * 100)}%`
      },
      convertedWorkflow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔍 Validating workflow structure...');

    // Validate the input workflow
    const validation = validateWorkflowStructure(body.workflow || body);

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        message: 'Workflow validation failed'
      }, { status: 400 });
    }

    // Convert if it's a normal format workflow
    if (body.workflow && body.workflow.nodes && body.workflow.links) {
      console.log('🔄 Converting workflow...');

      const convertedWorkflow = processWorkflow(body.workflow);

      if (!convertedWorkflow) {
        return NextResponse.json({
          success: false,
          message: 'Workflow conversion failed'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Workflow converted successfully',
        originalFormat: 'normal',
        convertedWorkflow,
        nodeCount: Object.keys(convertedWorkflow).length
      });
    } else {
      // Already in API format
      return NextResponse.json({
        success: true,
        message: 'Workflow is already in API format',
        originalFormat: 'api',
        workflow: body.workflow || body,
        nodeCount: Object.keys(body.workflow || body).length
      });
    }
  } catch (error) {
    console.error('Validation/conversion error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}