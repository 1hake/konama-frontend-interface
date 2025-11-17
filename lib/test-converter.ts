/**
 * Test script for the workflow converter
 */

import { processWorkflow } from './workflowConverter';
import fs from 'fs';
import path from 'path';

// Test the converter with example files
async function testConverter() {
    try {
        console.log('🧪 Testing Workflow Converter...\n');

        // Load the normal format workflow
        const normalWorkflowPath = path.join(process.cwd(), 'app/api/proxy/example-normal.json');
        const apiWorkflowPath = path.join(process.cwd(), 'app/api/proxy/example-api.json');

        console.log('📂 Loading example files...');
        const normalWorkflow = JSON.parse(fs.readFileSync(normalWorkflowPath, 'utf-8'));
        const expectedApiWorkflow = JSON.parse(fs.readFileSync(apiWorkflowPath, 'utf-8'));

        console.log('🔄 Converting workflow...');
        const convertedWorkflow = processWorkflow(normalWorkflow);

        if (!convertedWorkflow) {
            console.error('❌ Conversion failed!');
            return;
        }

        console.log('✅ Conversion successful!\n');

        // Compare key metrics
        const expectedNodes = Object.keys(expectedApiWorkflow).length;
        const convertedNodes = Object.keys(convertedWorkflow).length;

        console.log('📊 Comparison Results:');
        console.log(`Expected nodes: ${expectedNodes}`);
        console.log(`Converted nodes: ${convertedNodes}`);
        console.log(`Node count match: ${expectedNodes === convertedNodes ? '✅' : '❌'}`);

        // Check if key nodes exist
        const keyNodes = ['31', '8', '9', '38', '39', '40', '45', '58', '59', '65'];
        console.log('\n🔍 Key Node Check:');

        for (const nodeId of keyNodes) {
            const expectedExists = nodeId in expectedApiWorkflow;
            const convertedExists = nodeId in convertedWorkflow;

            console.log(`Node ${nodeId}: Expected: ${expectedExists ? '✅' : '❌'}, Converted: ${convertedExists ? '✅' : '❌'}`);

            if (expectedExists && convertedExists) {
                const expectedType = expectedApiWorkflow[nodeId].class_type;
                const convertedType = convertedWorkflow[nodeId].class_type;
                console.log(`  - Type match: ${expectedType === convertedType ? '✅' : '❌'} (${convertedType})`);
            }
        }

        // Sample a few nodes for detailed comparison
        console.log('\n🔬 Detailed Node Analysis:');

        // Test KSampler node (31)
        if (convertedWorkflow['31']) {
            const ksampler = convertedWorkflow['31'];
            console.log('KSampler (31):');
            console.log(`  - Class type: ${ksampler.class_type}`);
            console.log(`  - Has seed: ${ksampler.inputs.seed !== undefined ? '✅' : '❌'}`);
            console.log(`  - Has steps: ${ksampler.inputs.steps !== undefined ? '✅' : '❌'}`);
            console.log(`  - Has model connection: ${Array.isArray(ksampler.inputs.model) ? '✅' : '❌'}`);
            console.log(`  - Has positive conditioning: ${Array.isArray(ksampler.inputs.positive) ? '✅' : '❌'}`);
        }

        // Test CLIP Text Encode node (45)
        if (convertedWorkflow['45']) {
            const clipEncode = convertedWorkflow['45'];
            console.log('\nCLIP Text Encode (45):');
            console.log(`  - Class type: ${clipEncode.class_type}`);
            console.log(`  - Has text input: ${clipEncode.inputs.text !== undefined ? '✅' : '❌'}`);
            console.log(`  - Has clip connection: ${Array.isArray(clipEncode.inputs.clip) ? '✅' : '❌'}`);
        }

        // Save converted workflow for inspection
        const outputPath = path.join(process.cwd(), 'converted-workflow-test.json');
        fs.writeFileSync(outputPath, JSON.stringify(convertedWorkflow, null, 2));
        console.log(`\n💾 Converted workflow saved to: ${outputPath}`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
if (require.main === module) {
    testConverter();
}

export { testConverter };