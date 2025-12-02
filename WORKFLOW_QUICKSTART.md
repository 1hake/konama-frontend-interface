# Quick Start: Workflow Prompt Injection System

## What You Got

A complete system to inject user prompts into ComfyUI workflows and submit them to your backend API.

## Files Created

### 1. **Types** (`types/workflow-api.ts`)
- Complete TypeScript definitions for ComfyUI workflows
- `WorkflowData`, `ComfyUINode`, `PromptSubmissionPayload`, etc.

### 2. **Utilities** (`lib/workflowPromptInjector.ts`)
- `injectPromptIntoWorkflow()` - Finds CLIPTextEncode nodes and replaces prompts
- `generateComfyClientId()` - Creates unique client IDs
- `validateWorkflowStructure()` - Validates workflow before submission

### 3. **API Route** (`app/api/submit-workflow/route.ts`)
- Proxies workflow submissions to backend `/prompt` endpoint
- Handles authentication and error responses

### 4. **React Hook** (`hooks/useWorkflowSubmission.ts`)
- `useWorkflowSubmission()` - Manages submission state and logic
- Integrates prompt injection and API calls

### 5. **UI Component** (`components/WorkflowPromptForm.tsx`)
- Complete form for workflow selection and prompt input
- Dropdown for workflows, text areas for prompts
- Mode selection (slow/fast)

### 6. **Demo Page** (`app/workflow-generation/page.tsx`)
- Full-page example at `/workflow-generation`
- Protected route requiring authentication

### 7. **Tests** (`lib/workflowPromptInjector.test.ts`)
- Browser console tests for debugging
- `testPromptInjection()`, `testWithRealWorkflow()`, `testEndToEnd()`

### 8. **Documentation** (`WORKFLOW_PROMPT_INJECTION.md`)
- Complete system documentation
- Architecture diagrams, usage examples, troubleshooting

## How to Use

### Quick Test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/workflow-generation
   ```

3. **Login** with your credentials

4. **Use the form:**
   - Select a workflow from dropdown
   - Enter positive prompt: "A beautiful sunset over mountains"
   - Enter negative prompt: "blurry, low quality"
   - Click "Generate Image"

5. **Check console** for detailed logs

### Programmatic Usage

```typescript
import { useWorkflowSubmission } from '@/hooks';
import { WorkflowPromptForm } from '@/components';

// In your component
const { submitWorkflow, isSubmitting, error, response } = useWorkflowSubmission({
  onSuccess: (data) => alert('Success!'),
  onError: (err) => alert('Error!')
});

// Submit manually
await submitWorkflow({
  workflowId: 'basic-wf-test',
  workflowData: fetchedWorkflow,
  userPrompt: {
    positive: 'Your prompt here',
    negative: 'bad quality'
  },
  mode: 'slow'
});

// Or use the pre-built form
<WorkflowPromptForm />
```

## How It Works

```
1. User selects workflow → Fetches from /api/workflows
2. User enters prompts → Stored in state
3. User clicks submit → Triggers workflow injection
4. System finds CLIPTextEncode nodes → Replaces widget_values
5. Modified workflow sent to /api/submit-workflow
6. Proxy forwards to backend /prompt endpoint
7. Backend processes → Returns response
```

## What Gets Sent

Your backend receives this format at `/prompt`:

```json
{
  "workflow_id": "basic-wf-test",
  "mode": "slow",
  "prompt": {
    "id": "workflow-uuid",
    "nodes": [
      {
        "id": 6,
        "type": "CLIPTextEncode",
        "widgets_values": ["YOUR POSITIVE PROMPT"]
      },
      {
        "id": 7,
        "type": "CLIPTextEncode",
        "widgets_values": ["YOUR NEGATIVE PROMPT"]
      }
    ]
    // ... rest of workflow structure
  },
  "comfyClientId": "web-client-123456"
}
```

## Testing

### Browser Console Tests

Open browser console and run:

```javascript
// Test basic injection
testWorkflowInjection.testPromptInjection()

// Test with real workflow from backend
testWorkflowInjection.testWithRealWorkflow('basic-wf-test')

// Test full submission flow (doesn't actually submit)
testWorkflowInjection.testEndToEnd(
  'basic-wf-test',
  'beautiful landscape',
  'low quality'
)
```

## Key Features

✅ **Automatic Node Detection** - Finds CLIPTextEncode nodes by title or order
✅ **Workflow Validation** - Validates structure before submission
✅ **Error Handling** - Comprehensive error messages and logging
✅ **Type Safety** - Full TypeScript support
✅ **Authentication** - Integrated with your auth system
✅ **Reusable Components** - Hooks and components for custom UIs

## Next Steps

1. **Test the system** at `/workflow-generation`
2. **Check console logs** to see prompt injection working
3. **Verify backend receives** correct payload format
4. **Customize UI** or use hooks in your own components
5. **Add more workflows** to your backend for testing

## Troubleshooting

**Workflows not loading?**
- Check `/api/workflows` endpoint
- Verify authentication token
- Check backend API is running

**Prompts not injecting?**
- Verify workflow has CLIPTextEncode nodes
- Check console for warnings
- Review node titles (should contain "positive" or "negative")

**Submission failing?**
- Check `/api/submit-workflow` logs
- Verify backend `/prompt` endpoint
- Ensure workflow structure is valid

## Need Help?

- Read full docs: `WORKFLOW_PROMPT_INJECTION.md`
- Check workflow API docs: `WORKFLOW_API_README.md`
- Review auth docs: `AUTH_SYSTEM_README.md`
- Test in browser console using test utilities
