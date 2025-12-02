import { WorkflowData, UserPromptInput, ComfyUINode } from '@/types/workflow-api';

/**
 * Injects user prompts into a ComfyUI workflow by finding CLIPTextEncode nodes
 * and replacing their widget_values with the provided positive and negative prompts.
 * 
 * @param workflow - The original workflow data
 * @param userPrompt - The user's positive and negative prompts
 * @returns A new workflow with injected prompts
 */
export function injectPromptIntoWorkflow(
  workflow: WorkflowData,
  userPrompt: UserPromptInput
): WorkflowData {
  // Deep clone the workflow to avoid mutations
  const modifiedWorkflow: WorkflowData = JSON.parse(JSON.stringify(workflow));

  // Find all CLIPTextEncode nodes
  const clipTextEncodeNodes = modifiedWorkflow.nodes.filter(
    (node) => node.type === 'CLIPTextEncode'
  );

  if (clipTextEncodeNodes.length === 0) {
    console.warn('No CLIPTextEncode nodes found in workflow');
    return modifiedWorkflow;
  }

  // Strategy: Identify positive and negative prompt nodes
  // Common patterns:
  // 1. Node titles containing "positive", "prompt", or appearing first
  // 2. Node titles containing "negative"
  // 3. Order-based (first node = positive, second = negative)

  let positiveNode: ComfyUINode | null = null;
  let negativeNode: ComfyUINode | null = null;

  // Try to identify nodes by title
  for (const node of clipTextEncodeNodes) {
    const title = node.title?.toLowerCase() || '';

    if (
      title.includes('positive') ||
      title.includes('prompt positif') ||
      title.includes('main prompt')
    ) {
      positiveNode = node;
    } else if (
      title.includes('negative') ||
      title.includes('prompt negatif') ||
      title.includes('négatif')
    ) {
      negativeNode = node;
    }
  }

  // Fallback: Use order-based approach if titles don't help
  if (!positiveNode && clipTextEncodeNodes.length >= 1) {
    // Sort by order property to ensure correct assignment
    const sortedNodes = [...clipTextEncodeNodes].sort((a, b) => a.order - b.order);
    positiveNode = sortedNodes[0];

    if (sortedNodes.length >= 2) {
      negativeNode = sortedNodes[1];
    }
  }

  // Inject positive prompt
  if (positiveNode && userPrompt.positive) {
    positiveNode.widgets_values = [userPrompt.positive];
    console.log(`✅ Injected positive prompt into node ${positiveNode.id}`);
  }

  // Inject negative prompt (if provided and node exists)
  if (negativeNode && userPrompt.negative) {
    negativeNode.widgets_values = [userPrompt.negative];
    console.log(`✅ Injected negative prompt into node ${negativeNode.id}`);
  } else if (userPrompt.negative && !negativeNode) {
    console.warn('⚠️ Negative prompt provided but no suitable node found');
  }

  return modifiedWorkflow;
}

/**
 * Generates a unique client ID for ComfyUI requests
 */
export function generateComfyClientId(): string {
  return `web-client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validates that a workflow has the required structure for prompt injection
 */
export function validateWorkflowStructure(workflow: WorkflowData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('Workflow missing nodes array');
  }

  if (!workflow.links || !Array.isArray(workflow.links)) {
    errors.push('Workflow missing links array');
  }

  const clipNodes = workflow.nodes?.filter((n) => n.type === 'CLIPTextEncode') || [];
  if (clipNodes.length === 0) {
    errors.push('No CLIPTextEncode nodes found - cannot inject prompts');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
