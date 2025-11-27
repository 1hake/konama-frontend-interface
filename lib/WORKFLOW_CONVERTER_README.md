# Universal ComfyUI Workflow Converter

A comprehensive TypeScript utility to convert ComfyUI workflows from the normal/UI format to the API format that can be executed programmatically.

## Overview

This converter handles the transformation of ComfyUI workflow files from the human-readable node graph format (with visual positions, links, etc.) to the streamlined API format that ComfyUI expects for programmatic execution.

## Features

- ✅ **Universal Support**: Works with any ComfyUI workflow, including custom nodes
- ✅ **Smart Parameter Mapping**: Automatically maps widget values to the correct parameter names
- ✅ **Special Node Handling**: Built-in support for complex nodes like KSampler, Flux nodes, etc.
- ✅ **Link Resolution**: Properly converts visual node connections to API references
- ✅ **Mode Filtering**: Automatically excludes muted (mode 4) and bypassed (mode 2) nodes
- ✅ **UI Node Filtering**: Removes documentation and UI-only nodes from API workflow
- ✅ **Error Handling**: Comprehensive validation and error reporting
- ✅ **Type Safety**: Full TypeScript support with proper interfaces

## Usage

### Basic Usage

```typescript
import { processWorkflow } from './lib/workflowConverter';

// From a workflow file
const workflow = JSON.parse(fs.readFileSync('workflow.json', 'utf-8'));
const apiWorkflow = processWorkflow(workflow);

if (apiWorkflow) {
    // Send to ComfyUI API
    const response = await fetch('http://localhost:8188/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: apiWorkflow }),
    });
}
```

### Integration Example

```typescript
// In your API route (Next.js example)
export async function POST(request: NextRequest) {
    const body = await request.json();

    // Check if we need to convert the workflow format
    if (body.workflow && body.workflow.nodes && body.workflow.links) {
        console.log('🔄 Converting workflow from normal format to API format');
        const convertedWorkflow = processWorkflow(body.workflow);

        if (convertedWorkflow) {
            // Use the converted workflow
            const requestBody = { prompt: convertedWorkflow };
            // Forward to ComfyUI...
        }
    }
}
```

## Supported Node Types

The converter includes comprehensive support for:

### Core Nodes

- **Sampling**: KSampler, KSamplerAdvanced
- **VAE**: VAEDecode, VAEEncode, VAELoader
- **Models**: CheckpointLoaderSimple, UNETLoader, CLIPLoader, DualCLIPLoader
- **Text**: CLIPTextEncode, CLIPTextEncodeSDXL
- **Images**: SaveImage, LoadImage, PreviewImage

### Specialized Nodes

- **Flux**: FluxGuidance, FluxResolutionNode
- **LoRA**: LoraLoader, LoraLoaderModelOnly, PowerLoraLoader
- **Upscaling**: UltimateSDUpscale, ImageScale, LatentUpscale
- **ControlNet**: ControlNetLoader, ControlNetApply
- **Conditioning**: ConditioningZeroOut, ConditioningCombine, etc.

### Custom Nodes

- **Automatically detects** parameter patterns for unknown node types
- **Extensible mapping** system for adding new node support

## Node Mode Handling

The converter respects ComfyUI node modes:

- **Mode 0** (Normal): ✅ Included in API workflow
- **Mode 2** (Bypass): ❌ Excluded from API workflow
- **Mode 4** (Mute): ❌ Excluded from API workflow

## UI Node Filtering

These node types are automatically excluded as they're UI-only:

- Documentation nodes (MarkdownNote, Note, etc.)
- Preview nodes (PreviewImage, DisplayFloat, etc.)
- Organization nodes (Reroute, Junction, etc.)
- rgthree utility nodes (Label, Image Comparer, etc.)

## Widget Mapping System

The converter uses a sophisticated widget mapping system:

### 1. Predefined Mappings

```typescript
// Example: KSampler widgets
widgets_values: [
    seed,
    'randomize',
    steps,
    cfg,
    sampler_name,
    scheduler,
    denoise,
];
// Maps to: { seed: 123, steps: 20, cfg: 1, sampler_name: "euler", ... }
```

### 2. Input Detection

Automatically detects parameter names from node input definitions.

### 3. Pattern Inference

Infers parameter names for unknown nodes based on common patterns:

- Nodes ending in "Loader" → `['model_name', 'device']`
- Nodes containing "Sampler" → `['seed', 'steps', 'cfg', ...]`
- Nodes containing "Text" → `['text']`

### 4. Fallback System

Uses generic parameter names (`param_0`, `param_1`, etc.) when all else fails.

## Error Handling & Validation

```typescript
const result = processWorkflow(workflow);

if (!result) {
    // Check console for detailed error messages:
    // - Invalid workflow structure
    // - Missing required properties
    // - Conversion failures
    // - Validation errors
}
```

## Advanced Configuration

### Adding Custom Node Support

```typescript
// In getWidgetMappingForNodeType function
const mappings: Record<string, string[]> = {
    // Add your custom node
    MyCustomNode: ['param1', 'param2', 'param3'],
    // ... existing mappings
};
```

### Custom Special Handling

```typescript
// In handleSpecialNodeCases function
switch (node.type) {
    case 'MyComplexNode':
        // Custom widget processing logic
        if (widgetValues.length >= 3) {
            apiNode.inputs.special_param = processSpecialValue(widgetValues[0]);
        }
        break;
}
```

## Testing

The converter includes a comprehensive test suite:

```bash
npx tsx lib/test-converter.ts
```

This will:

- Load example workflows
- Convert them to API format
- Compare against expected results
- Validate all key nodes and parameters
- Generate detailed compatibility reports

## API Reference

### Main Functions

#### `processWorkflow(input: any): ApiWorkflow | null`

Main conversion function that handles input normalization, conversion, and validation.

#### `convertWorkflowToApi(normalWorkflow: NormalWorkflow): ApiWorkflow`

Core conversion logic that transforms workflow structure.

#### `validateApiWorkflow(workflow: ApiWorkflow): boolean`

Validates the converted workflow meets API requirements.

### Interfaces

```typescript
interface NormalWorkflowNode {
    id: number;
    type: string;
    inputs: Array<{
        name: string;
        type: string;
        link?: number;
        widget?: { name: string };
    }>;
    widgets_values?: any[];
    mode?: number;
}

interface ApiWorkflowNode {
    inputs: Record<string, any>;
    class_type: string;
    _meta?: { title?: string };
}
```

## Examples

### Converting a Basic Workflow

```typescript
const workflow = {
    nodes: [
        {
            id: 1,
            type: 'CLIPTextEncode',
            widgets_values: ['a beautiful landscape'],
            inputs: [{ name: 'clip', type: 'CLIP', link: 1 }],
        },
    ],
    links: [[1, 2, 0, 1, 0, 'CLIP']],
};

const api = processWorkflow(workflow);
// Result: {
//   "1": {
//     "inputs": {
//       "text": "a beautiful landscape",
//       "clip": ["2", 0]
//     },
//     "class_type": "CLIPTextEncode"
//   }
// }
```

### Handling Complex Nodes

The converter automatically handles complex nodes with special parameter ordering:

```typescript
// KSampler with seed randomization
widgets_values: [123456, "randomize", 20, 1, "euler", "simple", 1]
// ↓ Converts to:
{
  "seed": 123456,      // Seed value
  // "randomize" skipped
  "steps": 20,         // Sampling steps
  "cfg": 1,           // CFG scale
  "sampler_name": "euler",
  "scheduler": "simple",
  "denoise": 1
}
```

## Troubleshooting

### Common Issues

1. **Missing Parameters**: Check console logs for widget mapping details
2. **Wrong Node Count**: Verify node modes (bypass/mute nodes are excluded)
3. **Connection Errors**: Ensure link IDs match between nodes and links arrays
4. **Custom Nodes**: Add custom mappings or rely on automatic detection

### Debug Mode

Enable detailed logging by checking console output during conversion:

```
🔄 Processing workflow conversion...
📊 Input workflow structure: { hasNodes: true, nodeCount: 21, ... }
✅ Conversion completed
📊 Output API workflow: { nodeCount: 11, nodeIds: [...] }
```

## Contributing

To extend the converter:

1. Add new node mappings to `getWidgetMappingForNodeType()`
2. Add special handling to `handleSpecialNodeCases()`
3. Update UI node filters in `isUIOnlyNode()`
4. Add tests to verify conversion accuracy

## License

MIT License - feel free to use in your ComfyUI projects!
