/**
 * Workflow debugging and fixing utilities
 */

import {
    processWorkflow,
    ApiWorkflow,
    NormalWorkflow,
} from './workflowConverter';

/**
 * Analyzes a workflow and provides detailed information about potential issues
 */
export function analyzeWorkflow(
    workflow: NormalWorkflow | Record<string, unknown>
): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    nodeAnalysis: Array<{
        id: number;
        type: string;
        mode: number;
        status: 'active' | 'bypassed' | 'muted' | 'ui-only';
        hasRequiredParams: boolean;
        missingParams?: string[];
    }>;
} {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const nodeAnalysis: Array<{
        id: number;
        type: string;
        mode: number;
        status: 'active' | 'bypassed' | 'muted' | 'ui-only';
        hasRequiredParams: boolean;
        missingParams?: string[];
    }> = [];

    if (!workflow || !(workflow as NormalWorkflow).nodes) {
        return {
            isValid: false,
            issues: ['Workflow is missing or has no nodes'],
            recommendations: [
                'Ensure workflow has a valid structure with nodes array',
            ],
            nodeAnalysis: [],
        };
    }

    // Required parameters for problematic node types
    const requiredParams: Record<string, string[]> = {
        FluxResolutionNode: [
            'megapixel',
            'aspect_ratio',
            'divisible_by',
            'custom_ratio',
        ],
        LoraLoaderModelOnly: ['lora_name', 'strength_model'],
        UpscaleModelLoader: ['model_name'],
        UltimateSDUpscale: [
            'upscale_by',
            'seed',
            'steps',
            'cfg',
            'sampler_name',
            'scheduler',
            'denoise',
            'mode_type',
            'tile_width',
            'tile_height',
            'mask_blur',
            'tile_padding',
        ],
    };

    // Analyze each node
    for (const node of (workflow as NormalWorkflow).nodes) {
        const mode = node.mode || 0;
        let status: 'active' | 'bypassed' | 'muted' | 'ui-only' = 'active';
        let hasRequiredParams = true;
        let missingParams: string[] = [];

        if (mode === 4) status = 'muted';
        else if (mode === 2) status = 'bypassed';
        else if (isUIOnlyNodeType(node.type)) status = 'ui-only';

        // Check required parameters for active nodes
        if (status === 'active' && requiredParams[node.type]) {
            const required = requiredParams[node.type];
            const widgetValues = node.widgets_values || [];

            // For nodes without special handling, check if widget values are sufficient
            if (widgetValues.length < required.length) {
                hasRequiredParams = false;
                missingParams = required.slice(widgetValues.length);
            }
        }

        nodeAnalysis.push({
            id: node.id,
            type: node.type,
            mode,
            status,
            hasRequiredParams,
            missingParams: missingParams.length > 0 ? missingParams : undefined,
        });

        // Identify potential issues
        if (status === 'active' && !hasRequiredParams) {
            issues.push(
                `Node ${node.id} (${node.type}) is active but missing parameters: ${missingParams.join(', ')}`
            );
            recommendations.push(
                `Set node ${node.id} (${node.type}) to bypass mode (mode: 2) or provide missing parameters`
            );
        }
    }

    // Count nodes by status
    const statusCounts = nodeAnalysis.reduce(
        (acc, node) => {
            acc[node.status] = (acc[node.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    console.log('📊 Workflow Analysis:', {
        totalNodes: (workflow as NormalWorkflow).nodes.length,
        statusCounts,
        issuesFound: issues.length,
    });

    return {
        isValid: issues.length === 0,
        issues,
        recommendations,
        nodeAnalysis,
    };
}

/**
 * Automatically fixes common workflow issues
 */
export function autoFixWorkflow(workflow: Record<string, unknown>): {
    fixed: Record<string, unknown>;
    changes: string[];
} {
    const changes: string[] = [];
    const fixed = JSON.parse(JSON.stringify(workflow)); // Deep clone

    if (!fixed.nodes) {
        return { fixed, changes: ['Cannot fix: workflow has no nodes'] };
    }

    const problematicTypes = [
        'UltimateSDUpscale',
        'UpscaleModelLoader',
        'LoraLoaderModelOnly',
    ];

    for (const node of fixed.nodes) {
        // Auto-bypass nodes that commonly cause parameter issues
        if (problematicTypes.includes(node.type) && node.mode === 0) {
            node.mode = 2; // Set to bypass
            changes.push(`Set node ${node.id} (${node.type}) to bypass mode`);
        }

        // Fix missing widget values for FluxResolutionNode
        if (
            node.type === 'FluxResolutionNode' &&
            (!node.widgets_values || node.widgets_values.length < 5)
        ) {
            node.widgets_values = [
                '1.0', // megapixel
                '1:1 (Square)', // aspect_ratio
                '64', // divisible_by
                false, // custom_ratio
                '1:1', // custom_aspect_ratio
            ];
            changes.push(
                `Fixed missing widget values for FluxResolutionNode (${node.id})`
            );
        }
    }

    return { fixed, changes };
}

/**
 * Checks if a node type is UI-only
 */
function isUIOnlyNodeType(nodeType: string): boolean {
    const uiOnlyNodes = [
        'MarkdownNote',
        'Note',
        'TextNode',
        'Label (rgthree)',
        'Fast Groups Muter (rgthree)',
        'Image Comparer (rgthree)',
        'PreviewImage',
        'DisplayFloat',
        'DisplayInt',
        'DisplayString',
    ];
    return uiOnlyNodes.includes(nodeType);
}

/**
 * Comprehensive workflow validation and fixing
 */
export function validateAndFixWorkflow(workflow: Record<string, unknown>): {
    success: boolean;
    workflow: Record<string, unknown>;
    apiWorkflow: ApiWorkflow | null;
    analysis: {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
        nodeAnalysis: Array<{
            id: number;
            type: string;
            mode: number;
            status: 'active' | 'bypassed' | 'muted' | 'ui-only';
            hasRequiredParams: boolean;
            missingParams?: string[];
        }>;
    };
    fixes: string[];
} {
    console.log('🔧 Starting workflow validation and fixing...');

    // Step 1: Analyze original workflow
    const analysis = analyzeWorkflow(workflow);

    // Step 2: Auto-fix if issues found
    let fixedWorkflow = workflow;
    let fixes: string[] = [];

    if (!analysis.isValid) {
        console.log('🛠️  Auto-fixing workflow issues...');
        const fixResult = autoFixWorkflow(workflow);
        fixedWorkflow = fixResult.fixed;
        fixes = fixResult.changes;

        console.log('✅ Applied fixes:', fixes);
    }

    // Step 3: Try conversion
    const apiWorkflow = processWorkflow(fixedWorkflow);

    return {
        success: !!apiWorkflow,
        workflow: fixedWorkflow,
        apiWorkflow,
        analysis,
        fixes,
    };
}

/**
 * Quick fix for the most common issue: bypass problematic upscale nodes
 */
export function quickFixBypassUpscaleNodes(
    workflow: Record<string, unknown>
): Record<string, unknown> {
    const fixed = JSON.parse(JSON.stringify(workflow));

    if (!fixed.nodes) return fixed;

    const nodesToBypass = [
        'UltimateSDUpscale',
        'UpscaleModelLoader',
        'Image Comparer (rgthree)',
        'PreviewImage',
    ];

    for (const node of fixed.nodes) {
        if (nodesToBypass.includes(node.type) && node.mode !== 2) {
            node.mode = 2; // Set to bypass
            console.log(`🔧 Bypassed node ${node.id} (${node.type})`);
        }
    }

    return fixed;
}
