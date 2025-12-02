/**
 * Test utility for workflow prompt injection system
 * 
 * Run this in the browser console to test the injection logic
 */

import { injectPromptIntoWorkflow, validateWorkflowStructure, generateComfyClientId } from './workflowPromptInjector';
import { WorkflowData, UserPromptInput } from '@/types/workflow-api';

// Sample workflow for testing (simplified version)
const sampleWorkflow: WorkflowData = {
  id: "test-workflow",
  revision: 0,
  last_node_id: 7,
  last_link_id: 6,
  nodes: [
    {
      id: 1,
      type: "CLIPTextEncode",
      pos: [300, 50],
      size: [400, 150],
      flags: {},
      order: 2,
      mode: 0,
      inputs: [{ name: "clip", type: "CLIP", link: 1 }],
      outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [2] }],
      properties: { "Node name for S&R": "CLIPTextEncode" },
      widgets_values: ["original positive prompt"],
      title: "CLIP Text Encode (Positive)"
    },
    {
      id: 2,
      type: "CLIPTextEncode",
      pos: [300, 250],
      size: [400, 150],
      flags: {},
      order: 3,
      mode: 0,
      inputs: [{ name: "clip", type: "CLIP", link: 1 }],
      outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [3] }],
      properties: { "Node name for S&R": "CLIPTextEncode" },
      widgets_values: ["original negative prompt"],
      title: "CLIP Text Encode (Negative)"
    }
  ],
  links: [
    [1, 0, 0, 1, 0, "CLIP"],
    [2, 1, 0, 3, 0, "CONDITIONING"],
    [3, 2, 0, 3, 1, "CONDITIONING"]
  ],
  groups: [],
  config: {},
  extra: {
    ds: { scale: 1, offset: [0, 0] },
    frontendVersion: "1.0.0"
  },
  version: 0.4
};

/**
 * Test prompt injection
 */
export function testPromptInjection() {
  console.group('🧪 Testing Workflow Prompt Injection');

  const userPrompt: UserPromptInput = {
    positive: "A beautiful sunset over the ocean",
    negative: "blurry, low quality, watermark"
  };

  console.log('📥 Input workflow:', sampleWorkflow);
  console.log('📝 User prompts:', userPrompt);

  // Validate workflow
  console.log('\n1️⃣ Validating workflow structure...');
  const validation = validateWorkflowStructure(sampleWorkflow);
  console.log('Validation result:', validation);

  if (!validation.valid) {
    console.error('❌ Validation failed:', validation.errors);
    console.groupEnd();
    return;
  }

  // Inject prompts
  console.log('\n2️⃣ Injecting prompts...');
  const modifiedWorkflow = injectPromptIntoWorkflow(sampleWorkflow, userPrompt);

  // Check results
  console.log('\n3️⃣ Checking results...');
  const clipNodes = modifiedWorkflow.nodes.filter(n => n.type === 'CLIPTextEncode');
  
  clipNodes.forEach(node => {
    console.log(`Node ${node.id}:`, {
      title: node.title,
      original_value: sampleWorkflow.nodes.find(n => n.id === node.id)?.widgets_values,
      modified_value: node.widgets_values
    });
  });

  // Generate client ID
  console.log('\n4️⃣ Generating client ID...');
  const clientId = generateComfyClientId();
  console.log('Generated client ID:', clientId);

  console.log('\n✅ Test complete!');
  console.groupEnd();

  return {
    validation,
    modifiedWorkflow,
    clientId
  };
}

/**
 * Test with actual workflow data from backend
 */
export async function testWithRealWorkflow(workflowName: string) {
  console.group(`🧪 Testing with real workflow: ${workflowName}`);

  try {
    // Fetch workflow from API
    console.log('📡 Fetching workflow from API...');
    const response = await fetch(`/api/workflows/${workflowName}`);
    const { data: workflow } = await response.json();

    console.log('✅ Workflow fetched:', workflow);

    // Test injection
    const userPrompt: UserPromptInput = {
      positive: "Test positive prompt",
      negative: "Test negative prompt"
    };

    console.log('📝 Injecting test prompts...');
    const result = injectPromptIntoWorkflow(workflow, userPrompt);

    console.log('✅ Injection complete!');
    console.log('Modified workflow:', result);

    // Find CLIPTextEncode nodes to verify
    const clipNodes = result.nodes.filter(n => n.type === 'CLIPTextEncode');
    console.log(`Found ${clipNodes.length} CLIPTextEncode nodes`);
    clipNodes.forEach((node, idx) => {
      console.log(`  Node ${idx + 1}:`, node.widgets_values);
    });

    console.groupEnd();
    return result;

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * Test end-to-end submission
 */
export async function testEndToEnd(workflowName: string, positivePrompt: string, negativePrompt?: string) {
  console.group('🧪 Testing End-to-End Workflow Submission');

  try {
    // 1. Fetch workflow
    console.log('1️⃣ Fetching workflow...');
    const workflowResponse = await fetch(`/api/workflows/${workflowName}`);
    const { data: workflow } = await workflowResponse.json();
    console.log('✅ Workflow fetched');

    // 2. Inject prompts
    console.log('2️⃣ Injecting prompts...');
    const modifiedWorkflow = injectPromptIntoWorkflow(workflow, {
      positive: positivePrompt,
      negative: negativePrompt
    });
    console.log('✅ Prompts injected');

    // 3. Create payload
    console.log('3️⃣ Creating submission payload...');
    const payload = {
      workflow_id: workflowName,
      mode: 'slow',
      prompt: modifiedWorkflow,
      comfyClientId: generateComfyClientId()
    };
    console.log('Payload:', payload);

    // 4. Submit (commented out to avoid actual submission during testing)
    console.log('4️⃣ Ready to submit (skipping actual submission)');
    console.log('To submit, uncomment the fetch call below');
    
    /*
    const submitResponse = await fetch('/api/submit-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await submitResponse.json();
    console.log('✅ Submission result:', result);
    */

    console.log('\n✅ End-to-end test complete (submission skipped)');
    console.groupEnd();

    return payload;

  } catch (error) {
    console.error('❌ End-to-end test failed:', error);
    console.groupEnd();
    throw error;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).testWorkflowInjection = {
    testPromptInjection,
    testWithRealWorkflow,
    testEndToEnd
  };

  console.log('🧪 Workflow injection tests loaded!');
  console.log('Available tests:');
  console.log('  - testWorkflowInjection.testPromptInjection()');
  console.log('  - testWorkflowInjection.testWithRealWorkflow(workflowName)');
  console.log('  - testWorkflowInjection.testEndToEnd(workflowName, positivePrompt, negativePrompt)');
}
