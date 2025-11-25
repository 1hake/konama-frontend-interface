/**
 * Test utility for workflow conversion
 */

import { processWorkflow } from './workflowConverter';
import fs from 'fs';
import path from 'path';

/**
 * Test the workflow converter with example files
 */
export function testWorkflowConversion() {
  try {
    // Load example files
    const normalWorkflowPath = path.join(process.cwd(), 'app/api/proxy/example-normal.json');
    const expectedApiWorkflowPath = path.join(process.cwd(), 'app/api/proxy/example-api.json');

    const normalWorkflow = JSON.parse(fs.readFileSync(normalWorkflowPath, 'utf8'));
    const expectedApiWorkflow = JSON.parse(fs.readFileSync(expectedApiWorkflowPath, 'utf8'));

    // Convert the workflow
    const convertedWorkflow = processWorkflow(normalWorkflow);

    if (!convertedWorkflow) {
      console.error('❌ Conversion failed');
      return false;
    }

    console.log('✅ Conversion successful');
    console.log('📊 Expected nodes:', Object.keys(expectedApiWorkflow).length);
    console.log('📊 Converted nodes:', Object.keys(convertedWorkflow).length);

    // Compare key nodes
    const keyNodes = ['31', '38', '39', '40', '45', '8', '9']; // KSampler, UNETLoader, VAELoader, etc.

    for (const nodeId of keyNodes) {
      if (expectedApiWorkflow[nodeId] && convertedWorkflow[nodeId]) {
        console.log(`✅ Node ${nodeId} (${expectedApiWorkflow[nodeId].class_type}) present in both`);
      } else if (expectedApiWorkflow[nodeId]) {
        console.log(`⚠️  Node ${nodeId} (${expectedApiWorkflow[nodeId].class_type}) missing from conversion`);
      }
    }

    // Save the converted workflow for inspection
    const outputPath = path.join(process.cwd(), 'app/api/proxy/converted-test.json');
    fs.writeFileSync(outputPath, JSON.stringify(convertedWorkflow, null, 2));
    console.log(`💾 Converted workflow saved to: ${outputPath}`);

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Validate a workflow structure
 */
export function validateWorkflowStructure(workflow: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflow) {
    errors.push('Workflow is null or undefined');
    return { isValid: false, errors };
  }

  if (typeof workflow !== 'object') {
    errors.push('Workflow must be an object');
    return { isValid: false, errors };
  }

  const workflowObj = workflow as Record<string, unknown>;

  // Check if it's a normal format workflow
  if (workflowObj.nodes && Array.isArray(workflowObj.nodes) && workflowObj.links && Array.isArray(workflowObj.links)) {
    console.log('📋 Detected normal format workflow');

    // Validate nodes structure
    for (let i = 0; i < workflowObj.nodes.length; i++) {
      const node = workflowObj.nodes[i] as Record<string, unknown>;
      if (!node.id || (!node.type && !node.class_type)) {
        errors.push(`Node ${i} missing id or type/class_type`);
      }
      const nodeType = node.type || node.class_type || 'unknown';
      if (node.inputs && !Array.isArray(node.inputs)) {
        errors.push(`Node ${i} (${nodeType}) inputs must be an array`);
      }
      if (node.widgets_values && !Array.isArray(node.widgets_values)) {
        errors.push(`Node ${i} (${nodeType}) widgets_values must be an array`);
      }
    }

    // Validate links structure
    for (let i = 0; i < workflowObj.links.length; i++) {
      const link = workflowObj.links[i];
      if (!Array.isArray(link) || link.length !== 6) {
        errors.push(`Link ${i} must be an array of 6 elements`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Check if it's an API format workflow
  const nodeIds = Object.keys(workflow);
  if (nodeIds.length > 0) {
    console.log('📋 Detected API format workflow');

    for (const nodeId of nodeIds) {
      const node = workflow[nodeId];
      if (!node.class_type || !node.inputs) {
        errors.push(`Node ${nodeId} missing class_type or inputs`);
      }
      if (typeof node.inputs !== 'object') {
        errors.push(`Node ${nodeId} inputs must be an object`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  errors.push('Workflow format not recognized (neither normal nor API format)');
  return { isValid: false, errors };
}