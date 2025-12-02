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

// ComfyUI Workflow Structure (based on actual ComfyUI format)
export interface WorkflowData {
  id: string;
  revision: number;
  last_node_id: number;
  last_link_id: number;
  nodes: ComfyUINode[];
  links: ComfyUILink[];
  groups: ComfyUIGroup[];
  config: Record<string, any>;
  extra?: {
    ds?: {
      scale: number;
      offset: number[];
    };
    frontendVersion?: string;
    [key: string]: any;
  };
  version: number;
}

// ComfyUI Node structure
export interface ComfyUINode {
  id: number;
  type: string;
  pos: [number, number];
  size: [number, number] | number[];
  flags: Record<string, any>;
  order: number;
  mode: number;
  inputs?: ComfyUINodeInput[];
  outputs?: ComfyUINodeOutput[];
  properties: {
    'Node name for S&R': string;
    [key: string]: any;
  };
  widgets_values?: any[];
  title?: string;
  color?: string;
  bgcolor?: string;
}

export interface ComfyUINodeInput {
  name: string;
  type: string;
  link?: number | null;
  label?: string;
  slot_index?: number;
  widget?: {
    name: string;
  };
}

export interface ComfyUINodeOutput {
  name: string;
  type: string;
  links?: number[] | null;
  label?: string;
  slot_index?: number;
  shape?: number;
}

// ComfyUI Link format: [link_id, source_node_id, source_slot, target_node_id, target_slot, type]
export type ComfyUILink = [number, number, number, number, number, string];

export interface ComfyUIGroup {
  id?: number;
  title: string;
  bounding: [number, number, number, number];
  color: string;
  font_size?: number;
  flags?: Record<string, any>;
}

// Prompt Submission Payload (exact format for backend /prompt endpoint)
export interface PromptSubmissionPayload {
  workflow_id: string;
  mode: 'slow' | 'fast';
  prompt: WorkflowData; // The complete workflow structure
  comfyClientId: string;
}

// User prompt input for injection
export interface UserPromptInput {
  positive: string;
  negative?: string;
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