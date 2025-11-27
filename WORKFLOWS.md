# Multi-Workflow System Documentation

## Overview

The image generation system now supports multiple ComfyUI workflows, allowing you to switch between different models and generation techniques seamlessly.

## Architecture

### Components

1. **Workflow Manager** (`lib/workflowManager.ts`)
    - Central registry for all workflows
    - Handles workflow loading and generation
    - Provides workflow metadata

2. **Workflow Definitions** (`workflows/`)
    - JSON files defining workflow metadata and parameters
    - Each workflow has its own configuration file

3. **Workflow Selector** (`components/WorkflowSelector.tsx`)
    - UI component for selecting workflows
    - Displays workflow information and status

4. **Type Definitions** (`types/index.ts`)
    - TypeScript interfaces for workflows
    - Parameter definitions and metadata structures

## Available Workflows

### 1. Flux Krea Dev (Default)

- **ID**: `flux-krea-dev`
- **Description**: Advanced Flux model with LoRA support and dynamic resolution
- **Features**:
    - Dynamic aspect ratio selection
    - LoRA model support
    - Configurable guidance scale
    - High-quality output

**Parameters**:

- Steps: 1-50 (default: 20)
- Aspect Ratio: Multiple presets
- Guidance: 1-10 (default: 3.5)
- LoRA Name: Text input
- LoRA Strength: 0-2 (default: 1.0)

### 2. Stable Diffusion 1.5 Basic

- **ID**: `sd15-basic`
- **Description**: Classic SD 1.5 workflow with KSampler
- **Features**:
    - Fast generation
    - Multiple samplers
    - Customizable dimensions
    - CFG scale control

**Parameters**:

- Steps: 1-150 (default: 20)
- CFG Scale: 1-20 (default: 8)
- Width: 256-1024 (default: 512)
- Height: 256-1024 (default: 512)
- Sampler: Multiple options
- Scheduler: Multiple options
- Checkpoint: Text input

## Using the System

### In the UI

1. **Select Workflow**
    - Open the form
    - Look for the "🔧 Workflow ComfyUI" section at the top
    - Click on your desired workflow
    - The active workflow is highlighted with a purple border

2. **Configure Parameters**
    - Fill in the prompt fields
    - Adjust workflow-specific parameters in the Technical Parameters section
    - Parameters automatically adapt to the selected workflow

3. **Generate Images**
    - Click "Générer" to start generation
    - Progress is tracked in real-time
    - Generated images appear on the left side

### Programmatically

```typescript
import { workflowManager } from './lib/workflowManager';

// Get available workflows
const workflows = workflowManager.getAvailableWorkflows();

// Get specific workflow
const fluxWorkflow = workflowManager.getWorkflow('flux-krea-dev');

// Generate workflow JSON
const workflowJson = workflowManager.generateWorkflowJson(
    'flux-krea-dev',
    'A beautiful landscape',
    'blurry, low quality',
    {
        steps: 25,
        aspectRatio: '16:9 (Landscape)',
        guidance: 4.0,
    }
);

// Use in generation
await generateImage(prompt, negativePrompt, {
    workflowId: 'flux-krea-dev',
    steps: 25,
    guidance: 4.0,
});
```

## Adding Custom Workflows

### Step 1: Create Workflow JSON

Create `workflows/my-workflow.json`:

```json
{
    "metadata": {
        "id": "my-workflow",
        "name": "My Custom Workflow",
        "description": "Custom workflow for specific use case",
        "category": "custom",
        "author": "Your Name",
        "version": "1.0.0",
        "tags": ["custom", "specialized"],
        "supportsNegativePrompt": true,
        "requiredModels": ["my-model.safetensors"],
        "parameters": [
            {
                "name": "quality",
                "label": "Quality",
                "type": "slider",
                "defaultValue": 80,
                "min": 1,
                "max": 100,
                "step": 1,
                "description": "Output quality"
            }
        ]
    },
    "workflowTemplate": "my-workflow"
}
```

### Step 2: Implement Workflow Generator

Edit `lib/workflowManager.ts`:

```typescript
// Import workflow
import myWorkflow from '../workflows/my-workflow.json';

// In registerDefaultWorkflows():
this.workflows.set('my-workflow', {
    metadata: myWorkflow.metadata as WorkflowMetadata,
    workflow: this.createMyWorkflow
});

// Add generator function:
private createMyWorkflow(
    positivePrompt: string,
    negativePrompt: string,
    options: WorkflowGenerationOptions = {}
): any {
    const { quality = 80 } = options;
    const seed = Math.floor(Math.random() * 1000000000000000);

    return {
        "1": {
            "inputs": {
                "text": positivePrompt,
                // ... your workflow nodes
            },
            "class_type": "YourNodeClass",
            "_meta": { "title": "Your Node" }
        },
        // ... more nodes
    };
}
```

### Step 3: Test Your Workflow

1. Restart the development server
2. Open the application
3. Your workflow should appear in the selector
4. Test with various prompts and parameters

## Workflow Structure

### Metadata Fields

| Field                  | Type        | Required | Description             |
| ---------------------- | ----------- | -------- | ----------------------- |
| id                     | string      | ✓        | Unique identifier       |
| name                   | string      | ✓        | Display name            |
| description            | string      | ✓        | Brief description       |
| category               | string      | ✓        | Category for grouping   |
| author                 | string      | ✗        | Creator name            |
| version                | string      | ✗        | Version number          |
| tags                   | string[]    | ✗        | Searchable tags         |
| thumbnail              | string      | ✗        | Preview image path      |
| supportsNegativePrompt | boolean     | ✗        | Negative prompt support |
| requiredModels         | string[]    | ✗        | Required model files    |
| parameters             | Parameter[] | ✗        | Configurable parameters |

### Parameter Types

#### Slider

```typescript
{
  name: "steps",
  label: "Steps",
  type: "slider",
  defaultValue: 20,
  min: 1,
  max: 50,
  step: 1,
  description: "Number of steps"
}
```

#### Select Dropdown

```typescript
{
  name: "sampler",
  label: "Sampler",
  type: "select",
  defaultValue: "euler",
  options: ["euler", "ddim", "dpm_2"],
  description: "Sampling method"
}
```

#### Text Input

```typescript
{
  name: "model",
  label: "Model",
  type: "text",
  defaultValue: "model.safetensors",
  description: "Model filename"
}
```

#### Number Input

```typescript
{
  name: "seed",
  label: "Seed",
  type: "number",
  defaultValue: -1,
  description: "Generation seed"
}
```

## API Endpoints

### GET /api/workflows

Get all available workflows.

**Response**:

```json
{
  "success": true,
  "workflows": [
    {
      "id": "flux-krea-dev",
      "name": "Flux Krea Dev",
      "description": "...",
      "category": "flux",
      "parameters": [...]
    }
  ],
  "count": 2
}
```

### POST /api/proxy

Generate images using selected workflow.

**Request**:

```json
{
    "prompt": {
        // Generated workflow JSON
    },
    "client_id": "unique-id"
}
```

## Best Practices

### 1. Workflow Design

- Keep workflows modular and reusable
- Use clear, descriptive node titles
- Document required models and dependencies
- Test workflows in ComfyUI first

### 2. Parameter Configuration

- Provide sensible defaults
- Set appropriate min/max ranges
- Include helpful descriptions
- Use consistent naming conventions

### 3. Error Handling

- Validate required models exist
- Check parameter bounds
- Provide clear error messages
- Log generation details

### 4. Performance

- Optimize node connections
- Cache workflow definitions
- Minimize unnecessary computations
- Use appropriate batch sizes

## Troubleshooting

### Workflow Not Appearing

1. Check workflow JSON syntax
2. Verify workflow ID is unique
3. Ensure workflow is registered in manager
4. Restart development server

### Generation Fails

1. Check required models are installed
2. Verify node class names match ComfyUI
3. Validate parameter values
4. Check ComfyUI server logs

### Parameters Not Working

1. Verify parameter names in workflow generator
2. Check parameter types and ranges
3. Ensure proper destructuring in generator
4. Test with default values first

## Examples

### Adding an Upscaler Workflow

```typescript
// workflows/upscaler.json
{
  "metadata": {
    "id": "upscaler-4x",
    "name": "4x Upscaler",
    "description": "Upscale images 4x with ESRGAN",
    "category": "upscaling",
    "tags": ["upscale", "enhance"],
    "parameters": [
      {
        "name": "scale",
        "label": "Scale Factor",
        "type": "slider",
        "defaultValue": 4,
        "min": 2,
        "max": 8,
        "step": 2
      }
    ]
  },
  "workflowTemplate": "upscaler-4x"
}

// In workflowManager.ts
private createUpscalerWorkflow(
    positivePrompt: string,
    negativePrompt: string,
    options: WorkflowGenerationOptions = {}
): any {
    const { scale = 4 } = options;

    return {
        "1": {
            "inputs": {
                "image": positivePrompt, // Assuming image path
                "upscale_method": "lanczos",
                "scale": scale
            },
            "class_type": "ImageScale",
            "_meta": { "title": "Upscale" }
        },
        "2": {
            "inputs": {
                "images": ["1", 0]
            },
            "class_type": "SaveImage",
            "_meta": { "title": "Save" }
        }
    };
}
```

### Adding ControlNet Workflow

```typescript
// workflows/controlnet.json
{
  "metadata": {
    "id": "controlnet-canny",
    "name": "ControlNet Canny",
    "description": "Canny edge detection with ControlNet",
    "category": "controlnet",
    "parameters": [
      {
        "name": "control_strength",
        "label": "Control Strength",
        "type": "slider",
        "defaultValue": 1.0,
        "min": 0,
        "max": 2,
        "step": 0.1
      }
    ]
  },
  "workflowTemplate": "controlnet-canny"
}
```

## Future Enhancements

- [ ] Dynamic workflow loading from external sources
- [ ] Workflow versioning and updates
- [ ] Workflow sharing and export
- [ ] Visual workflow editor
- [ ] Workflow templates library
- [ ] Performance optimization
- [ ] Workflow validation tools
- [ ] Community workflow repository

## Resources

- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [Workflow Examples](workflows/README.md)
- [API Reference](API.md)
- [Contributing Guide](CONTRIBUTING.md)

## Support

For issues or questions:

1. Check existing workflows in `workflows/` directory
2. Review workflow manager implementation
3. Test with ComfyUI directly
4. Open an issue with workflow JSON and error logs
