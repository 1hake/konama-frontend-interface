# Mock Mode Documentation

## Overview

Mock mode allows you to test the image generation interface without requiring access to external ComfyUI or workflow service endpoints. This is useful for development, testing, and demonstrations.

## Features

### 1. Mock Image Generation

When enabled, the image generation process simulates the entire workflow:
- Queued status
- Progress updates with different nodes
- Realistic timing delays
- Mock image output

### 2. Mock Workflows

Three fake workflows are provided for testing:
- **Flux Dev (Mock)** - Simulates Flux.1 Dev model
- **Stable Diffusion 1.5 (Mock)** - Simulates SD 1.5 basic workflow
- **SDXL Turbo (Mock)** - Simulates fast SDXL Turbo workflow

Each mock workflow includes:
- Full metadata (name, description, category)
- Source indicator (local)
- Tags and parameters
- Required models list
- Version information

## Configuration

### Enable Mock Modes

Edit your `.env.local` file:

```bash
# Mock Mode Configuration - Enable mock data for testing without endpoints
NEXT_PUBLIC_MOCK_IMAGE_GENERATION=true
NEXT_PUBLIC_MOCK_WORKFLOWS=true
```

### Disable Mock Modes

Set to `false` or remove the environment variables:

```bash
NEXT_PUBLIC_MOCK_IMAGE_GENERATION=false
NEXT_PUBLIC_MOCK_WORKFLOWS=false
```

## Usage

### Testing Image Generation

1. Enable mock image generation in `.env.local`
2. Restart your development server: `npm run dev`
3. Select any mock workflow from the workflow selector
4. Enter a prompt and generate
5. Watch the simulated progress:
   - Queued → Executing
   - LoadCheckpoint node (20% progress)
   - CLIPTextEncode node (50% progress)
   - KSampler node (80% progress)
   - Complete with mock image display

### Testing Workflows

1. Enable mock workflows in `.env.local`
2. Restart your development server
3. Open the workflow selector modal
4. See 3 fake workflows with full metadata
5. Select and use them as if they were real

## Mock Image Display

Mock images are displayed as:
- Purple gradient SVG placeholder
- "🎭 Mock Image ✨" text
- "Mock Generation Complete" subtitle
- "No endpoints required" footer

The mock image is generated client-side using SVG data URIs, requiring no image files or external requests.

## Development Benefits

- **No Backend Required**: Test frontend features independently
- **Predictable Results**: Consistent mock data for testing
- **Fast Iteration**: No network delays or API calls
- **Offline Development**: Work without internet connection
- **Demo Mode**: Show features without live services

## Console Logging

When mock mode is active, you'll see console messages:

```
🎭 MOCK MODE: Simulating image generation...
✅ MOCK MODE: Loaded 3 fake workflows
```

## Error Handling

- Mock mode bypasses all API error handling
- Workflow retrieval errors are hidden in the modal
- No network failures or timeouts

## Switching Between Mock and Real

You can toggle between mock and real mode by:

1. Changing environment variables
2. Restarting the dev server
3. No code changes required

This allows quick testing of both modes during development.

## Notes

- Mock mode is only available in development
- Production builds should have mock mode disabled
- Mock data is hardcoded and not persisted
- Mock images are always the same SVG placeholder
- Real workflow parameters are simulated in mock workflows
