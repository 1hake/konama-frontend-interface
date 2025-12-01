// Workflow API Response Schemas

// Response for GET /workflows (listWorkflows)
export interface WorkflowListResponse {
  data: WorkflowSummary[];
}

export interface WorkflowSummary {
  name: string;
}

// Response for GET /workflow?name={name} (getWorkflowByName)
export interface WorkflowDetailResponse {
  data: WorkflowData;
}

// The actual workflow structure (from wf.json files)
export interface WorkflowData {
  // Based on your code, this is parsed JSON content
  // You'll need to define the actual structure based on your wf.json format
  // Common workflow properties might include:
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  nodes?: WorkflowNode[];
  connections?: WorkflowConnection[];
  metadata?: Record<string, any>;
  // Add other properties as needed based on your actual wf.json structure
}

// Example workflow node structure (adjust based on your needs)
export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>;
}

// Example workflow connection structure (adjust based on your needs)
export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Error response schema
export interface ErrorResponse {
  error: string;
  message: string;
}

// API Client types for frontend
export interface WorkflowsApiClient {
  listWorkflows(): Promise<WorkflowListResponse>;
  getWorkflowByName(name: string): Promise<WorkflowDetailResponse>;
}