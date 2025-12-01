# Simplified Image Generation System

This system has been simplified to remove all workflow conversion complexity. It now uses a simple template replacement system for workflow generation.

## How it works

1. **Workflow Templates**: Stored in `/workflows/templates/` in API format with template variables like `{{positivePrompt}}`
2. **Template Processing**: Variables are replaced with actual values  
3. **Direct Sending**: Processed workflows are sent directly to ComfyUI

## API Endpoints

### 1. Generate Image with Workflow Template

**POST /api/prompt**

This is the main endpoint that matches your curl example.

```bash
curl -X POST http://localhost:3000/api/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "flux-krea-dev",
    "prompt": "a beautiful landscape with mountains and lakes",
    "negativePrompt": "blurry, low quality",
    "steps": 25,
    "guidance": 4.0,
    "aspectRatio": "16:9 (Landscape)"
  }'
```

**Body Parameters:**
- `workflowId` (required): ID of the workflow template (e.g., "flux-krea-dev")
- `prompt` (required): The positive prompt text
- `negativePrompt` (optional): Negative prompt text
- `steps` (optional): Number of generation steps (default: 20)
- `guidance` (optional): Guidance scale (default: 3.5)
- `aspectRatio` (optional): Image aspect ratio (default: "1:1 (Square)")
- Other workflow-specific parameters

### 2. List Available Workflows

**GET /api/workflows**

```bash
curl http://localhost:3000/api/workflows
```

Returns all available workflow templates with their metadata.

### 3. Generate Image (Alternative endpoint)

**POST /api/workflows/{workflowId}/prompt**

```bash
curl -X POST http://localhost:3000/api/workflows/flux-krea-dev/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "positivePrompt": "a beautiful landscape",
    "negativePrompt": "blurry, low quality",
    "steps": 25
  }'
```

### 4. Proxy Endpoint (for direct workflow sending)

**POST /api/proxy**

For sending pre-processed workflows directly to ComfyUI.

```bash
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"prompt": {...}}'
```

## Workflow Template Structure

Workflows are stored in two parts:

1. **Metadata** (`/workflows/{name}.json`):
```json
{
  "metadata": {
    "id": "flux-krea-dev",
    "name": "Flux Krea Dev", 
    "description": "Advanced Flux model with LoRA support",
    "parameters": [...]
  },
  "workflowTemplate": "flux-krea-dev"
}
```

2. **Template Content** (`/workflows/templates/{name}.json`):
```json
{
  "40": {
    "inputs": {
      "clip_name1": "clip_l.safetensors",
      "clip_name2": "t5xxl_fp16.safetensors"
    },
    "class_type": "DualCLIPLoader"
  },
  "45": {
    "inputs": {
      "text": "{{positivePrompt}}",
      "clip": ["40", 0]
    },
    "class_type": "CLIPTextEncode"
  }
}
```

## Template Variables

Common template variables that get replaced:

- `{{positivePrompt}}` - Main prompt text
- `{{negativePrompt}}` - Negative prompt text  
- `{{steps}}` - Number of generation steps
- `{{guidance}}` - Guidance scale
- `{{seed}}` - Random seed
- `{{aspectRatio}}` - Image aspect ratio
- `{{loraName}}` - LoRA model filename
- `{{loraStrength}}` - LoRA model strength

## Example: Complete Image Generation Flow

1. **Client sends request**:
   ```bash
   curl -X POST http://localhost:3000/api/prompt \
     -H "Content-Type: application/json" \
     -d '{
       "workflowId": "flux-krea-dev",
       "prompt": "a majestic dragon flying over a castle",
       "steps": 30,
       "guidance": 4.5
     }'
   ```

2. **System processes**:
   - Loads workflow template `flux-krea-dev`
   - Replaces `{{positivePrompt}}` with "a majestic dragon flying over a castle"
   - Replaces `{{steps}}` with 30
   - Replaces `{{guidance}}` with 4.5
   - Sets default values for other variables

3. **Sends to ComfyUI**:
   ```bash
   # Internally makes this request to ComfyUI
   curl -X POST ${COMFY_API_URL}/prompt \
     -H "Content-Type: application/json" \
     -d '{"prompt": {...processed workflow...}}'
   ```

4. **Returns ComfyUI response** to the client

## Environment Variables

Make sure to set:
```
NEXT_PUBLIC_COMFY_API_URL=https://your-comfyui-endpoint.com
```

## Benefits of This Approach

- ✅ **Simple**: No complex workflow conversion
- ✅ **Fast**: Direct template replacement  
- ✅ **Reliable**: Templates are already in correct API format
- ✅ **Maintainable**: Easy to add new workflows
- ✅ **Flexible**: Support for any ComfyUI workflow structure