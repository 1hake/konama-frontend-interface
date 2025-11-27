# ComfyUI Workflows

This directory contains ComfyUI workflow configurations for the image generation system.

## Overview

Each workflow file defines:

- **Metadata**: Description, parameters, required models, etc.
- **Workflow Template**: The ComfyUI workflow structure

## File Structure

```
workflows/
├── flux-krea-dev.json       # Flux Krea Dev workflow
├── sd15-basic.json          # Stable Diffusion 1.5 basic workflow
└── README.md                # This file
```

## Adding a New Workflow

### 1. Create Workflow JSON File

Create a new JSON file in this directory (e.g., `my-workflow.json`):

```json
{
    "metadata": {
        "id": "my-workflow",
        "name": "My Custom Workflow",
        "description": "Description of what this workflow does",
        "category": "custom",
        "author": "Your Name",
        "version": "1.0.0",
        "tags": ["tag1", "tag2"],
        "supportsNegativePrompt": true,
        "requiredModels": ["model-checkpoint.safetensors"],
        "parameters": [
            {
                "name": "steps",
                "label": "Steps",
                "type": "slider",
                "defaultValue": 20,
                "min": 1,
                "max": 50,
                "step": 1,
                "description": "Number of denoising steps"
            }
        ]
    },
    "workflowTemplate": "my-workflow"
}
```

### 2. Register Workflow in WorkflowManager

Edit `/lib/workflowManager.ts` and add your workflow:

```typescript
// Import your workflow
import myWorkflow from '../workflows/my-workflow.json';

// In registerDefaultWorkflows():
this.workflows.set('my-workflow', {
    metadata: myWorkflow.metadata as WorkflowMetadata,
    workflow: this.createMyWorkflow
});

// Add workflow generator function:
private createMyWorkflow(
    positivePrompt: string,
    negativePrompt: string,
    options: WorkflowGenerationOptions = {}
): any {
    const { steps = 20 } = options;
    const seed = Math.floor(Math.random() * 1000000000000000);

    return {
        // Your ComfyUI workflow JSON structure
        // Node IDs should be strings
        "1": {
            "inputs": { /* ... */ },
            "class_type": "NodeType",
            "_meta": { "title": "Node Title" }
        },
        // ... more nodes
    };
}
```

## Workflow Metadata Fields

| Field                    | Type                | Required | Description                                           |
| ------------------------ | ------------------- | -------- | ----------------------------------------------------- |
| `id`                     | string              | Yes      | Unique identifier for the workflow                    |
| `name`                   | string              | Yes      | Display name                                          |
| `description`            | string              | Yes      | Brief description                                     |
| `category`               | string              | Yes      | Category (e.g., "flux", "stable-diffusion", "custom") |
| `author`                 | string              | No       | Author name                                           |
| `version`                | string              | No       | Version number                                        |
| `tags`                   | string[]            | No       | Tags for filtering                                    |
| `thumbnail`              | string              | No       | Path to thumbnail image                               |
| `supportsNegativePrompt` | boolean             | No       | Whether it supports negative prompts                  |
| `requiredModels`         | string[]            | No       | List of required model files                          |
| `parameters`             | WorkflowParameter[] | No       | Configurable parameters                               |

## Parameter Types

### Slider

```json
{
    "name": "steps",
    "label": "Steps",
    "type": "slider",
    "defaultValue": 20,
    "min": 1,
    "max": 50,
    "step": 1,
    "description": "Number of steps"
}
```

### Select

```json
{
    "name": "sampler",
    "label": "Sampler",
    "type": "select",
    "defaultValue": "euler",
    "options": ["euler", "dpm_2", "ddim"],
    "description": "Sampling method"
}
```

### Text Input

```json
{
    "name": "checkpoint",
    "label": "Checkpoint",
    "type": "text",
    "defaultValue": "model.safetensors",
    "description": "Model checkpoint filename"
}
```

### Number Input

```json
{
    "name": "width",
    "label": "Width",
    "type": "number",
    "defaultValue": 512,
    "min": 256,
    "max": 2048,
    "step": 64,
    "description": "Image width"
}
```

## ComfyUI Workflow Structure

Your workflow generator function should return a ComfyUI-compatible workflow object:

```typescript
{
  "node_id": {
    "inputs": {
      "parameter_name": value,
      "connected_input": ["source_node_id", output_index]
    },
    "class_type": "NodeClassName",
    "_meta": {
      "title": "Display Title"
    }
  }
}
```

### Key Points:

- Node IDs must be strings
- Connected inputs use `["node_id", output_index]` format
- Always include `class_type` matching the ComfyUI node class
- Use `_meta.title` for display purposes

## Example: Simple SD 1.5 Workflow

```typescript
private createSD15Workflow(
    positivePrompt: string,
    negativePrompt: string,
    options: WorkflowGenerationOptions = {}
): any {
    const { steps = 20, cfg = 7 } = options;
    const seed = Math.floor(Math.random() * 1000000000000000);

    return {
        "1": {
            "inputs": {
                "ckpt_name": "v1-5-pruned-emaonly.safetensors"
            },
            "class_type": "CheckpointLoaderSimple",
            "_meta": { "title": "Load Checkpoint" }
        },
        "2": {
            "inputs": {
                "text": positivePrompt,
                "clip": ["1", 1]
            },
            "class_type": "CLIPTextEncode",
            "_meta": { "title": "Positive Prompt" }
        },
        "3": {
            "inputs": {
                "text": negativePrompt,
                "clip": ["1", 1]
            },
            "class_type": "CLIPTextEncode",
            "_meta": { "title": "Negative Prompt" }
        },
        "4": {
            "inputs": {
                "width": 512,
                "height": 512,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": { "title": "Empty Latent" }
        },
        "5": {
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["3", 0],
                "latent_image": ["4", 0]
            },
            "class_type": "KSampler",
            "_meta": { "title": "Sampler" }
        },
        "6": {
            "inputs": {
                "samples": ["5", 0],
                "vae": ["1", 2]
            },
            "class_type": "VAEDecode",
            "_meta": { "title": "VAE Decode" }
        },
        "7": {
            "inputs": {
                "filename_prefix": "output",
                "images": ["6", 0]
            },
            "class_type": "SaveImage",
            "_meta": { "title": "Save Image" }
        }
    };
}
```

## Testing Your Workflow

1. Add your workflow file to this directory
2. Register it in `workflowManager.ts`
3. Restart the development server
4. The workflow should appear in the workflow selector
5. Test generation with your workflow

## Tips

- Use meaningful node IDs (they're just strings)
- Always generate a random seed for reproducibility
- Include proper error handling
- Document required models clearly
- Test with ComfyUI directly first
- Keep parameter names consistent with ComfyUI conventions

## Resources

- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Custom Nodes](https://github.com/ltdrdata/ComfyUI-Manager)
- [Workflow Examples](https://comfyworkflows.com/)
