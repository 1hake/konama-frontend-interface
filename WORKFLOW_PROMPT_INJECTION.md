# Workflow Prompt Injection System

A complete system for injecting user prompts into ComfyUI workflows and submitting them to the backend API.

## Overview

This system allows users to:
1. Select a workflow from available backend workflows
2. Enter custom positive and negative prompts
3. Automatically inject prompts into the workflow's CLIPTextEncode nodes
4. Submit the modified workflow to the backend `/prompt` endpoint

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface Layer                          │
│  - WorkflowPromptForm: Main UI component                        │
│  - /workflow-generation: Demo page                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Application Logic Layer                       │
│  - useWorkflowSubmission: React hook for state management       │
│  - useWorkflows: Fetch workflows from backend                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                          │
│  - workflowPromptInjector: Inject prompts into workflows        │
│  - Validation utilities                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer                                     │
│  - /api/submit-workflow: Proxy to backend /prompt              │
│  - /api/workflows: Fetch workflow list                          │
│  - /api/workflows/[name]: Fetch workflow details                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API                                   │
│  - POST /prompt: Submit workflow for generation                 │
│  - GET /workflows: List available workflows                     │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

### Types (`types/workflow-api.ts`)
- `WorkflowData`: Complete ComfyUI workflow structure
- `ComfyUINode`: Individual workflow node definition
- `PromptSubmissionPayload`: Format for backend submission
- `UserPromptInput`: User's positive/negative prompts

### Utilities (`lib/workflowPromptInjector.ts`)
```typescript
// Inject user prompts into workflow
injectPromptIntoWorkflow(workflow: WorkflowData, userPrompt: UserPromptInput): WorkflowData

// Generate unique client ID
generateComfyClientId(): string

// Validate workflow structure
validateWorkflowStructure(workflow: WorkflowData): { valid: boolean; errors: string[] }
```

### Hooks (`hooks/useWorkflowSubmission.ts`)
```typescript
const { 
  submitWorkflow,   // Function to submit workflow
  isSubmitting,     // Loading state
  error,            // Error state
  response,         // API response
  reset             // Reset state
} = useWorkflowSubmission({
  onSuccess: (data) => { /* ... */ },
  onError: (error) => { /* ... */ }
});
```

### API Routes
- **`/api/submit-workflow`**: Accepts workflow with prompts, forwards to backend `/prompt`
- **`/api/workflows`**: Lists available workflows
- **`/api/workflows/[name]`**: Gets workflow details by name

### Components
- **`WorkflowPromptForm`**: Complete form UI for workflow submission
- **`/workflow-generation`**: Demo page showcasing the system

## Usage

### Basic Usage

```typescript
import { useWorkflowSubmission } from '@/hooks';
import { injectPromptIntoWorkflow } from '@/lib/workflowPromptInjector';

// In your component
const { submitWorkflow, isSubmitting } = useWorkflowSubmission({
  onSuccess: (data) => console.log('Success!', data),
  onError: (error) => console.error('Error!', error)
});

// Submit a workflow
await submitWorkflow({
  workflowId: 'basic-wf-test',
  workflowData: fetchedWorkflow,
  userPrompt: {
    positive: 'A beautiful landscape',
    negative: 'blurry, low quality'
  },
  mode: 'slow'
});
```

### Using the Form Component

```typescript
import { WorkflowPromptForm } from '@/components';

export default function Page() {
  return <WorkflowPromptForm />;
}
```

## How It Works

### 1. Workflow Fetching
When the component mounts, it fetches all available workflows from the backend:
```typescript
const { workflows } = useWorkflows(); // Automatically fetches and caches
```

### 2. Prompt Injection
When the user submits, their prompts are injected into the workflow:
```typescript
const modifiedWorkflow = injectPromptIntoWorkflow(workflow, {
  positive: "beautiful scenery",
  negative: "text, watermark"
});
```

The injector:
- Finds all `CLIPTextEncode` nodes in the workflow
- Identifies positive/negative nodes by title or order
- Replaces `widgets_values` array with user prompts

### 3. Submission
The modified workflow is sent to the backend:
```typescript
const payload = {
  workflow_id: "basic-wf-test",
  mode: "slow",
  prompt: modifiedWorkflow,
  comfyClientId: "web-client-123456"
};

// POST to /api/submit-workflow → forwards to backend /prompt
```

## Payload Format

The system sends this format to the backend `/prompt` endpoint:

```json
{
  "workflow_id": "basic-wf-test",
  "mode": "slow",
  "prompt": {
    "id": "ab0d9db3-0fd2-41c3-9d7e-7e3aaa02c170",
    "revision": 0,
    "last_node_id": 10,
    "last_link_id": 9,
    "nodes": [
      {
        "id": 6,
        "type": "CLIPTextEncode",
        "widgets_values": ["YOUR POSITIVE PROMPT HERE"]
      },
      {
        "id": 7,
        "type": "CLIPTextEncode",
        "widgets_values": ["YOUR NEGATIVE PROMPT HERE"]
      }
      // ... other nodes
    ],
    "links": [ /* ... */ ],
    "groups": [],
    "config": {},
    "extra": { /* ... */ },
    "version": 0.4
  },
  "comfyClientId": "web-client-1733159123456-abc123"
}
```

## Node Detection Logic

The `injectPromptIntoWorkflow` function finds CLIPTextEncode nodes using this strategy:

1. **Title-based detection**: Looks for nodes with titles containing:
   - Positive: "positive", "prompt positif", "main prompt"
   - Negative: "negative", "prompt negatif", "négatif"

2. **Order-based fallback**: If titles don't match:
   - First node (by `order` property) = positive prompt
   - Second node = negative prompt

3. **Validation**: Warns if no suitable nodes found

## Testing

### Test the System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/workflow-generation`

3. Log in with your credentials

4. Select a workflow and enter prompts

5. Check browser console for detailed logs:
   ```
   🚀 Starting workflow submission: basic-wf-test
   ✅ Injected positive prompt into node 6
   ✅ Injected negative prompt into node 7
   📦 Submission payload prepared
   ✅ Workflow submitted successfully
   ```

### Manual Testing

```typescript
import { injectPromptIntoWorkflow, validateWorkflowStructure } from '@/lib/workflowPromptInjector';

// Validate workflow
const validation = validateWorkflowStructure(workflow);
console.log(validation); // { valid: true, errors: [] }

// Inject prompts
const modified = injectPromptIntoWorkflow(workflow, {
  positive: "test prompt",
  negative: "bad quality"
});

console.log(modified.nodes.find(n => n.type === 'CLIPTextEncode'));
// Should show widgets_values: ["test prompt"]
```

## Error Handling

The system handles several error cases:

- **No workflows available**: Shows message in dropdown
- **Invalid workflow structure**: Validates before submission
- **Missing CLIPTextEncode nodes**: Logs warning, continues
- **Backend errors**: Displays error message to user
- **Authentication errors**: Returns 401, redirects to login

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://client.konama.fuzdi.fr
```

## Security

- All requests require authentication (JWT token in Authorization header)
- Workflow submission proxied through Next.js API routes
- CORS handled by same-origin policy
- Input validation on both client and server

## Future Enhancements

Potential improvements:

1. **Advanced Node Detection**: Support more node types (SDXL, Flux, etc.)
2. **Workflow Templates**: Pre-configured workflows with parameter overrides
3. **Batch Processing**: Submit multiple prompts at once
4. **Result Polling**: Track generation status and display results
5. **Workflow Editor**: Visual workflow editor with prompt injection
6. **Caching**: Cache workflows to reduce API calls
7. **Validation**: More comprehensive workflow validation

## Troubleshooting

### Workflows not loading
- Check `/api/workflows` endpoint
- Verify backend API is accessible
- Check authentication token validity

### Prompts not injecting
- Verify workflow has CLIPTextEncode nodes
- Check node titles match detection patterns
- Review console logs for warnings

### Submission fails
- Check `/api/submit-workflow` logs
- Verify backend `/prompt` endpoint is working
- Ensure workflow structure is valid

## Related Documentation

- [Workflow API README](./WORKFLOW_API_README.md)
- [Authentication System](./AUTH_SYSTEM_README.md)
- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
