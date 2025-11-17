/**
 * Debug script for troubleshooting workflow issues
 */

import { validateAndFixWorkflow, analyzeWorkflow } from './workflowDebugger';
import { processWorkflow } from './workflowConverter';
import fs from 'fs';
import path from 'path';

async function debugWorkflow(workflowPath?: string) {
    try {
        console.log('🔍 Debugging Workflow Issues...\n');

        // Default to example workflow if no path provided
        const filePath = workflowPath || path.join(process.cwd(), 'app/api/proxy/example-normal.json');

        console.log('📂 Loading workflow from:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('❌ File not found:', filePath);
            return;
        }

        const workflow = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        console.log('\n1️⃣ === WORKFLOW ANALYSIS ===');
        const analysis = analyzeWorkflow(workflow);

        console.log(`Total nodes: ${analysis.nodeAnalysis.length}`);
        console.log(`Issues found: ${analysis.issues.length}`);

        if (analysis.issues.length > 0) {
            console.log('\n❌ Issues:');
            analysis.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

            console.log('\n💡 Recommendations:');
            analysis.recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
        }

        // Show problematic nodes
        const problematicNodes = analysis.nodeAnalysis.filter(n =>
            n.status === 'active' && !n.hasRequiredParams
        );

        if (problematicNodes.length > 0) {
            console.log('\n🚨 Problematic Active Nodes:');
            problematicNodes.forEach(node => {
                console.log(`   Node ${node.id} (${node.type}) - Missing: ${node.missingParams?.join(', ')}`);
            });
        }

        console.log('\n2️⃣ === AUTO-FIX ATTEMPT ===');
        const fixResult = validateAndFixWorkflow(workflow);

        if (fixResult.success) {
            console.log('✅ Auto-fix successful!');
            if (fixResult.fixes.length > 0) {
                console.log('🔧 Fixes applied:');
                fixResult.fixes.forEach((fix, i) => console.log(`   ${i + 1}. ${fix}`));
            }

            console.log('\n📊 Final API Workflow:');
            console.log(`   Nodes: ${Object.keys(fixResult.apiWorkflow!).length}`);
            console.log(`   Node IDs: ${Object.keys(fixResult.apiWorkflow!).join(', ')}`);
        } else {
            console.log('❌ Auto-fix failed');
        }

        console.log('\n3️⃣ === DIRECT CONVERSION TEST ===');
        const directResult = processWorkflow(workflow);

        if (directResult) {
            console.log('✅ Direct conversion successful');
            console.log(`   Nodes: ${Object.keys(directResult).length}`);
        } else {
            console.log('❌ Direct conversion failed');
        }

        console.log('\n4️⃣ === NODE MODE SUMMARY ===');
        const modeSummary = analysis.nodeAnalysis.reduce((acc, node) => {
            acc[node.status] = (acc[node.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(modeSummary).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} nodes`);
        });

        // Save debug output
        const debugOutput = {
            analysis,
            fixResult: fixResult.success ? {
                fixes: fixResult.fixes,
                nodeCount: Object.keys(fixResult.apiWorkflow!).length
            } : { error: 'Fix failed' },
            directConversion: directResult ? {
                nodeCount: Object.keys(directResult).length,
                nodeIds: Object.keys(directResult)
            } : { error: 'Direct conversion failed' }
        };

        const debugPath = path.join(process.cwd(), 'workflow-debug-output.json');
        fs.writeFileSync(debugPath, JSON.stringify(debugOutput, null, 2));
        console.log(`\n💾 Debug output saved to: ${debugPath}`);

    } catch (error) {
        console.error('❌ Debug script failed:', error);
    }
}

// Run if called directly
if (require.main === module) {
    const workflowPath = process.argv[2]; // Optional path argument
    debugWorkflow(workflowPath);
}

export { debugWorkflow };