# Funnel Feature - Implementation Documentation

## Overview

The **Funnel** feature is a multi-stage iterative image-generation pipeline that allows users to:
1. Generate images across multiple workflows/models simultaneously
2. Select the best results from each generation
3. Refine selected images with custom parameters
4. Iteratively improve results through multiple steps

## Architecture

### Core Components

#### 1. Data Layer
- **`types/funnel.ts`** - TypeScript interfaces for all funnel-related data structures
- **`lib/funnelStorage.ts`** - Filesystem-based JSON persistence layer
- **`lib/generationQueue.ts`** - Parallel workflow execution with mock generation

#### 2. API Layer
- **`/api/funnel/create`** - Create new funnel with initial generation
- **`/api/funnel/list`** - List all funnels
- **`/api/funnel/[funnelId]`** - Get/delete funnel state
- **`/api/funnel/[funnelId]/step/[stepId]/select`** - Mark images as selected
- **`/api/funnel/[funnelId]/step/create`** - Create next step with refinements

#### 3. Hooks
- **`hooks/useFunnel.ts`** - Main state management hook for funnel operations

#### 4. UI Components
- **`FunnelCreationModal`** - Modal for configuring and starting new funnels
- **`FunnelWorkflowSelector`** - Multi-select dropdown for workflow selection
- **`FunnelStepViewer`** - Grid display with image selection capabilities
- **`FunnelTimeline`** - Visual timeline for step navigation
- **`ImageRefinementPanel`** - Per-image parameter editor

#### 5. Pages
- **`/funnels`** - List all funnels
- **`/funnels/[id]`** - Funnel editor interface

## Data Structures

### Funnel
```typescript
interface Funnel {
  id: string;
  name: string;
  description?: string;
  config: FunnelConfig;
  steps: FunnelStep[];
  currentStepIndex: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}
```

### FunnelStep
```typescript
interface FunnelStep {
  id: string;
  funnelId: string;
  stepIndex: number;
  status: 'pending' | 'generating' | 'selecting' | 'completed';
  createdAt: string;
  completedAt?: string;
  parentStepId?: string;
  imageCount: number;
  selectedCount: number;
}
```

### FunnelImage
```typescript
interface FunnelImage {
  id: string;
  stepId: string;
  funnelId: string;
  filename: string;
  type: string;
  subfolder: string;
  workflowId: string;
  seed: number;
  parameters: Record<string, any>;
  prompt: string;
  negativePrompt?: string;
  selected: boolean;
  parentImageId?: string;
  generatedAt: string;
  jobId?: string;
}
```

## User Flow

### 1. Create Funnel
1. User clicks "New Funnel" button
2. Modal opens with configuration options:
   - Name and description
   - Select multiple workflows (multi-select)
   - Base prompt and negative prompt
   - Images per workflow
3. User submits → API creates funnel + initial step
4. System launches parallel generation across all selected workflows
5. User is redirected to funnel editor

### 2. View & Select Images
1. Timeline shows all steps with status indicators
2. Current step's images displayed in grid
3. User clicks images to select/deselect
4. Selection count updates in real-time
5. User clicks "Confirm Selection" to save

### 3. Refine Parameters
1. Selected images appear in refinement panel
2. User can:
   - Apply global prompt overrides to all selected
   - Change workflow per image
   - Adjust seed values
   - Modify other parameters
3. Changes are tracked as "refinements"

### 4. Create Next Step
1. User clicks "Create Next Step"
2. System creates new step
3. Generates variants for each selected image with refinements
4. Timeline updates with new step
5. Process repeats

## Storage Structure

```
/data/funnels/
  [funnelId]/
    funnel.json          # Funnel metadata
    steps/
      [stepId].json      # Step metadata
    images/
      [imageId].json     # Image metadata
    jobs/
      [jobId].json       # Generation job metadata
```

## Mock Generation

Currently using mock image generation for testing:
- **`generationQueue.ts`** simulates generation with progress updates
- Mock images are SVG placeholders showing workflow ID and seed
- Generation completes in 2-3 seconds per workflow
- Real ComfyUI integration can be added by replacing the `simulateGeneration` method

## Key Features

### ✅ Implemented
- Multi-workflow parallel generation
- Image selection with visual feedback
- Step-by-step refinement
- Timeline navigation
- Per-image parameter editing
- Batch prompt editing
- Funnel persistence (JSON files)
- Mock generation with progress tracking
- Funnel list/create/delete

### 🔄 Future Enhancements
- Real ComfyUI integration
- Image-to-image refinement
- ControlNet support
- LoRA switching
- Export funnel as JSON
- Clone/branch funnels
- Step comparison view
- Batch operations on selected images
- Generation queue with retry logic

## API Endpoints

### POST `/api/funnel/create`
Create new funnel with initial generation

**Request:**
```typescript
{
  name: string;
  description?: string;
  config: {
    selectedWorkflows: string[];
    basePrompt: string;
    baseNegativePrompt?: string;
    baseParameters?: Record<string, any>;
    imagesPerWorkflow?: number;
  }
}
```

**Response:**
```typescript
{
  funnel: Funnel;
  step: FunnelStep;
  images: FunnelImage[];
  jobs: Array<{ id: string; workflowId: string; status: string }>;
}
```

### GET `/api/funnel/list`
List all funnels

**Response:**
```typescript
{
  funnels: Funnel[];
}
```

### GET `/api/funnel/[funnelId]`
Get complete funnel state

**Response:**
```typescript
{
  funnel: Funnel;
  currentStep: FunnelStep | null;
  steps: FunnelStep[];
  images: FunnelImage[];
  selectedImages: FunnelImage[];
  jobs: GenerationJob[];
}
```

### POST `/api/funnel/[funnelId]/step/[stepId]/select`
Mark images as selected

**Request:**
```typescript
{
  imageIds: string[];
}
```

### POST `/api/funnel/[funnelId]/step/create`
Create next step with refinements

**Request:**
```typescript
{
  selectedImageIds: string[];
  refinements?: Array<{
    imageId: string;
    prompt?: string;
    negativePrompt?: string;
    seed?: number;
    workflowId?: string;
    parameters?: Record<string, any>;
  }>;
}
```

## Usage Example

```typescript
import { useFunnel } from '@/hooks/useFunnel';

function MyComponent() {
  const {
    funnel,
    currentStep,
    images,
    createFunnel,
    selectImages,
    createNextStep,
  } = useFunnel();

  // Create a new funnel
  const handleCreate = async () => {
    await createFunnel(
      {
        selectedWorkflows: ['flux-krea-dev', 'sd15-basic'],
        basePrompt: 'A beautiful landscape',
        baseParameters: {},
      },
      'My Funnel'
    );
  };

  // Select images
  const handleSelect = async (imageIds: string[]) => {
    await selectImages(imageIds);
  };

  // Create next step
  const handleNextStep = async (refinements) => {
    await createNextStep(refinements);
  };
}
```

## Testing

Currently all generation is mocked. To test:

1. Start dev server: `npm run dev`
2. Navigate to `/funnels`
3. Click "New Funnel"
4. Configure funnel (select multiple workflows)
5. Submit → Watch mock generation
6. Select images from results
7. Optionally refine parameters
8. Click "Create Next Step"
9. Repeat!

## Integration with Real ComfyUI

To connect to real ComfyUI, modify `lib/generationQueue.ts`:

Replace the `simulateGeneration` method with actual ComfyUI API calls:
```typescript
private async generateWithComfyUI(job: GenerationJob): Promise<FunnelImage[]> {
  // Load workflow
  const workflow = await loadWorkflow(job.workflowId);
  
  // Update workflow parameters
  const updatedWorkflow = updateWorkflowParameters(workflow, {
    prompt: job.prompt,
    negative_prompt: job.negativePrompt,
    ...job.parameters,
  });
  
  // Queue prompt
  const response = await fetch(`${COMFY_API_URL}/prompt`, {
    method: 'POST',
    body: JSON.stringify({ prompt: updatedWorkflow }),
  });
  
  // Poll for completion and get images
  // ... implementation
}
```

## Notes

- All timestamps are ISO 8601 strings
- Image IDs are prefixed with `img_`
- Step IDs are prefixed with `step_`
- Funnel IDs are prefixed with `funnel_`
- Job IDs are prefixed with `job_`
- Mock images start with `mock_` in filename

## License

Part of Fuzdi Studio - AI Image Generation Admin Interface
