#!/usr/bin/env node

/**
 * Test script for the new workflow API integration
 * Run with: node test-workflow-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const WORKFLOW_API_URL = process.env.NEXT_PUBLIC_WORKFLOW_API_URL || 'http://localhost:4000';

async function testWorkflowAPI() {
    console.log('🧪 Testing Workflow API Integration\n');
    
    // Test 1: List workflows
    console.log('📋 Test 1: Fetching workflow list...');
    try {
        const response = await axios.get(`${BASE_URL}/api/workflows`);
        console.log('✅ Success:', response.data);
        console.log(`Found ${response.data.workflows?.length || 0} workflows\n`);
        
        if (response.data.workflows?.length > 0) {
            const firstWorkflow = response.data.workflows[0];
            console.log(`🔍 Test 2: Fetching workflow '${firstWorkflow.id}'...`);
            
            // Test 2: Fetch specific workflow
            try {
                const workflowResponse = await axios.get(
                    `${BASE_URL}/api/workflows/workflow?name=${encodeURIComponent(firstWorkflow.id)}`
                );
                console.log('✅ Success: Fetched workflow JSON');
                console.log('Workflow keys:', Object.keys(workflowResponse.data));
                
                // Test 3: Generate image with workflow
                console.log('\n🎨 Test 3: Generating image with workflow...');
                try {
                    const generateResponse = await axios.post(`${BASE_URL}/api/prompt`, {
                        workflowId: firstWorkflow.id,
                        prompt: 'a beautiful landscape',
                        negativePrompt: 'blurry, low quality',
                        steps: 20
                    });
                    console.log('✅ Success: Image generation started');
                    console.log('Response:', generateResponse.data);
                } catch (generateError) {
                    console.error('❌ Image generation failed:', generateError.response?.data || generateError.message);
                }
                
            } catch (fetchError) {
                console.error('❌ Workflow fetch failed:', fetchError.response?.data || fetchError.message);
            }
        }
        
    } catch (listError) {
        console.error('❌ Workflow list failed:', listError.response?.data || listError.message);
    }
}

// Run the test if this is the main module
if (require.main === module) {
    testWorkflowAPI().catch(console.error);
}

module.exports = { testWorkflowAPI };