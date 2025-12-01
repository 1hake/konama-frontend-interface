# Workflow API Implementation

This document describes the implementation of the Workflow API client for fetching workflows from the external service at `https://client.konama.fuzdi.fr`.

## Files Created

### Types
- `types/workflow-api.ts` - TypeScript interfaces for API responses and data structures
- Updated `types/index.ts` - Exports the new workflow API types

### API Client
- `lib/workflowsApi.ts` - API client implementation with error handling
- Updated `lib/config.ts` - Uses the existing workflow API URL configuration

### React Hooks
- `hooks/useWorkflowsApi.ts` - React hook for managing workflow API state
- Updated `hooks/index.ts` - Exports the new hook

### Components
- `components/WorkflowApiList.tsx` - React component for displaying workflow list
- Updated `components/index.ts` - Exports the new component

### Example
- `app/workflow-api-example/page.tsx` - Complete usage example

## API Endpoints

The implementation supports these endpoints from `https://client.konama.fuzdi.fr`:

1. **GET /workflows** - Lists all available workflows
   - Returns: `{ data: [{ name: string }] }`

2. **GET /workflow?name={name}** - Gets detailed workflow data
   - Returns: `{ data: WorkflowData }`

## Usage Examples

### Basic Hook Usage

```typescript
import { useWorkflowsApi } from '@/hooks';

function MyComponent() {
  const { 
    workflows, 
    isLoading, 
    error, 
    fetchWorkflowByName 
  } = useWorkflowsApi();

  // workflows are automatically fetched on mount
  
  const handleGetDetails = async (name: string) => {
    const details = await fetchWorkflowByName(name);
    console.log(details);
  };

  return (
    <div>
      {workflows.map(workflow => (
        <button 
          key={workflow.name}
          onClick={() => handleGetDetails(workflow.name)}
        >
          {workflow.name}
        </button>
      ))}
    </div>
  );
}
```

### Using the WorkflowList Component

```typescript
import { WorkflowList } from '@/components';

function MyWorkflowSelector() {
  const [selectedWorkflow, setSelectedWorkflow] = useState('');

  return (
    <WorkflowList
      onWorkflowSelect={setSelectedWorkflow}
      selectedWorkflow={selectedWorkflow}
    />
  );
}
```

### Direct API Client Usage

```typescript
import { workflowsApi } from '@/lib/workflowsApi';

async function fetchWorkflows() {
  try {
    const response = await workflowsApi.listWorkflows();
    console.log('Available workflows:', response.data);
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
  }
}

async function getWorkflowDetails(name: string) {
  try {
    const response = await workflowsApi.getWorkflowByName(name);
    console.log('Workflow details:', response.data);
  } catch (error) {
    console.error('Failed to fetch workflow details:', error);
  }
}
```

## Type Definitions

### Core Types

```typescript
// API Response Types
interface WorkflowListResponse {
  data: WorkflowSummary[];
}

interface WorkflowDetailResponse {
  data: WorkflowData;
}

interface WorkflowSummary {
  name: string;
}

// Workflow data structure (customize based on your wf.json format)
interface WorkflowData {
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  nodes?: WorkflowNode[];
  connections?: WorkflowConnection[];
  metadata?: Record<string, any>;
}
```

## Configuration

The API client uses the URL from your environment configuration:

```typescript
// .env.local
NEXT_PUBLIC_WORKFLOW_API_URL=https://client.konama.fuzdi.fr
```

This is already configured in your `lib/config.ts` file.

## Error Handling

The implementation includes comprehensive error handling:

- Network errors are caught and formatted
- HTTP status errors are parsed from response JSON
- Fallback error messages for unexpected failures
- Loading states in the React hook
- Error state management with clear/retry functionality

## Features

1. **Automatic Fetching**: Workflows are fetched automatically when the hook mounts
2. **Loading States**: Built-in loading indicators
3. **Error Handling**: Comprehensive error management with retry functionality
4. **TypeScript Support**: Fully typed API responses and data structures
5. **Reusable Components**: Ready-to-use React components
6. **Flexible Usage**: Can be used as hooks, components, or direct API calls

## Testing

Visit `/workflow-api-example` in your application to see a working example that demonstrates:
- Fetching and displaying workflow lists
- Loading states
- Error handling
- Workflow detail fetching
- Complete integration example

## Customization

To customize the workflow data structure, update the `WorkflowData` interface in `types/workflow-api.ts` based on your actual `wf.json` file format. The current structure includes common workflow properties but should be adjusted to match your specific needs.