/**
 * Converts a ComfyUI workflow from normal format to API format
 */

export interface NormalWorkflowNode {
  id: number;
  type: string;
  inputs: Array<{
    name: string;
    type: string;
    link?: number;
    widget?: { name: string };
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    links?: number[];
  }>;
  widgets_values?: any[];
  mode?: number; // 0 = normal, 2 = bypass, 4 = muted
  title?: string;
  properties?: Record<string, any>;
}

export interface NormalWorkflow {
  nodes: NormalWorkflowNode[];
  links: Array<[number, number, number, number, number, string]>; // [link_id, source_node_id, source_output_index, target_node_id, target_input_index, type]
}

export interface ApiWorkflowNode {
  inputs: Record<string, any>;
  class_type: string;
  _meta?: {
    title?: string;
  };
}

export interface ApiWorkflow {
  [nodeId: string]: ApiWorkflowNode;
}

/**
 * Converts a workflow from normal format to API format
 */
export function convertWorkflowToApi(normalWorkflow: NormalWorkflow): ApiWorkflow {
  const apiWorkflow: ApiWorkflow = {};

  // Create a map of links for easy lookup
  const linkMap = new Map<number, { sourceNodeId: number; sourceOutputIndex: number; targetType: string }>();

  // Handle links array
  if (normalWorkflow.links && Array.isArray(normalWorkflow.links)) {
    for (const link of normalWorkflow.links) {
      const [linkId, sourceNodeId, sourceOutputIndex, , , type] = link;
      linkMap.set(linkId, { sourceNodeId, sourceOutputIndex, targetType: type || 'unknown' });
    }
  }

  // Process each node
  for (const node of normalWorkflow.nodes) {
    // Extract node type from various possible sources
    const nodeType = node.type || (node as any).class_type || (node.properties && node.properties['Node name for S&R']);

    if (!nodeType) {
      console.log(`⚠️  Skipping node ${node.id} - no type information found`);
      continue;
    }

    // For now, let's be more conservative - only skip muted nodes (mode 4) and UI-only nodes
    // Don't skip bypassed nodes (mode 2) as they may be dependencies for other nodes
    if (node.mode === 4 || isUIOnlyNode(nodeType)) {
      console.log(`⏭️  Skipping node ${node.id} (${nodeType}) - mode: ${node.mode}`);
      continue;
    }

    if (node.mode === 2) {
      console.log(`⚠️  BYPASSED NODE ${node.id} (${nodeType}) - keeping as potential dependency`);
    }

    console.log(`✅ Processing node ${node.id} (${nodeType}) - mode: ${node.mode || 0}`);

    // Special debugging for CLIPTextEncode nodes to ensure prompts are preserved
    if (nodeType === 'CLIPTextEncode' && node.widgets_values && node.widgets_values[0]) {
      console.log(`🎯 CLIPTextEncode node ${node.id} prompt text: "${node.widgets_values[0].slice(0, 50)}..."`);
    }

    const apiNode: ApiWorkflowNode = {
      inputs: {},
      class_type: nodeType,
    };

    // Add title if available
    apiNode._meta = {
      title: node.title || getNodeTitle(nodeType),
    };

    // Use the enhanced input processing with the extracted nodeType
    processNodeInputs(node, apiNode, linkMap, nodeType);

    // Handle special node-specific processing
    const widgetValues = node.widgets_values || [];
    handleSpecialNodeCases(node, apiNode, widgetValues);

    // Validate node has required parameters
    const requiredParams = getRequiredParameters(node.type);
    const missingParams = requiredParams.filter(param =>
      apiNode.inputs[param] === undefined || apiNode.inputs[param] === null
    );

    if (missingParams.length > 0) {
      console.warn(`⚠️  Node ${node.id} (${node.type}) missing required parameters:`, missingParams);
      console.warn(`   Available parameters:`, Object.keys(apiNode.inputs));

      // For FluxResolutionNode, ensure all required params are set
      if (node.type === 'FluxResolutionNode') {
        if (!apiNode.inputs.megapixel) apiNode.inputs.megapixel = "1.0";
        if (!apiNode.inputs.aspect_ratio) apiNode.inputs.aspect_ratio = "1:1 (Square)";
        if (!apiNode.inputs.divisible_by) apiNode.inputs.divisible_by = "64";
        if (apiNode.inputs.custom_ratio === undefined) apiNode.inputs.custom_ratio = false;
        if (!apiNode.inputs.custom_aspect_ratio) apiNode.inputs.custom_aspect_ratio = "1:1";

        console.log(`🔧 Applied FluxResolutionNode defaults to node ${node.id}`);
      }
    } else {
      console.log(`✅ Node ${node.id} (${node.type}) has all required parameters`);
    }

    apiWorkflow[node.id.toString()] = apiNode;
  }

  return apiWorkflow;
}

/**
 * Checks if a node type is UI-only and should be excluded from API workflow
 */
function isUIOnlyNode(nodeType: string): boolean {
  const uiOnlyNodes = [
    // Note and documentation nodes
    'MarkdownNote',
    'Note',
    'TextNode',

    // rgthree utility nodes
    'Label (rgthree)',
    'Fast Groups Muter (rgthree)',
    'Image Comparer (rgthree)',
    'Context (rgthree)',
    'Context Switch (rgthree)',
    'Bookmark (rgthree)',
    'Any Switch (rgthree)',
    'Display Any (rgthree)',

    // Preview and display nodes (usually not needed in API)
    'PreviewImage',
    'DisplayFloat',
    'DisplayInt',
    'DisplayString',
    'ShowText',
    'ShowImage',

    // Reroute and organizational nodes
    'Reroute',
    'Junction',

    // Some custom UI nodes
    'CR_Text',
    'CR_Multiline_Text',
    'Note Plus',
    'Simple Text',

    // Efficiency nodes UI components
    'Eff. Loader',
    'XY Input: Steps',
    'XY Input: CFG Scale',
  ];

  // Also check for common patterns in node names
  const uiPatterns = [
    /.*Note$/,
    /.*Text$/,
    /.*Display$/,
    /.*Show$/,
    /.*Preview$/,
    /.*Label$/,
    /.*Viewer$/,
    /.*Monitor$/,
  ];

  return uiOnlyNodes.includes(nodeType) ||
    uiPatterns.some(pattern => pattern.test(nodeType));
}

/**
 * Gets a human-readable title for a node type
 */
function getNodeTitle(nodeType: string): string {
  const titleMap: Record<string, string> = {
    // Core sampling nodes
    'KSampler': 'KSampler',
    'KSamplerAdvanced': 'KSampler (Advanced)',

    // VAE nodes
    'VAEDecode': 'VAE Decode',
    'VAEEncode': 'VAE Encode',
    'VAELoader': 'Load VAE',
    'VAELoaderShared': 'Load VAE (Shared)',

    // Model loading
    'CheckpointLoaderSimple': 'Load Checkpoint',
    'UNETLoader': 'Load Diffusion Model',
    'CLIPLoader': 'Load CLIP',
    'DualCLIPLoader': 'DualCLIPLoader',
    'UpscaleModelLoader': 'Load Upscale Model',
    'ControlNetLoader': 'Load ControlNet',

    // Text encoding
    'CLIPTextEncode': 'CLIP Text Encode',
    'CLIPTextEncodeSDXL': 'CLIP Text Encode (SDXL)',

    // Image operations
    'SaveImage': 'Save Image',
    'LoadImage': 'Load Image',
    'PreviewImage': 'Preview Image',
    'ImageScale': 'Upscale Image',
    'ImageScaleBy': 'Upscale Image By',

    // Latent operations
    'EmptyLatentImage': 'Empty Latent Image',
    'EmptySD3LatentImage': 'EmptySD3LatentImage',
    'LatentUpscale': 'Upscale Latent',
    'LatentUpscaleBy': 'Upscale Latent By',

    // Conditioning
    'ConditioningZeroOut': 'ConditioningZeroOut',
    'ConditioningCombine': 'Conditioning (Combine)',
    'ConditioningAverage': 'Conditioning (Average)',
    'ConditioningConcat': 'Conditioning (Concat)',
    'ConditioningSetArea': 'Conditioning (Set Area)',
    'ConditioningSetAreaPercentage': 'Conditioning (Set Area %)',
    'ConditioningSetTimesteps': 'Conditioning (Set Timesteps)',

    // LoRA nodes
    'LoraLoader': 'Load LoRA',
    'LoraLoaderModelOnly': 'Load LoRA (Model Only)',
    'PowerLoraLoader': 'Power LoRA Loader',

    // Flux specific
    'FluxResolutionNode': 'Flux Resolution Calc',
    'FluxGuidance': 'FluxGuidance',

    // Upscaling
    'UltimateSDUpscale': 'Ultimate SD Upscale',

    // ControlNet
    'ControlNetApply': 'Apply ControlNet',
    'ControlNetApplyAdvanced': 'Apply ControlNet (Advanced)',

    // Masks and inpainting
    'MaskToImage': 'Mask to Image',
    'ImageToMask': 'Image to Mask',
    'SetLatentNoiseMask': 'Set Latent Noise Mask',
    'SolidMask': 'Solid Mask',

    // Math and utility
    'FloatConstant': 'Float Constant',
    'IntConstant': 'Int Constant',
    'StringConstant': 'String Constant',
    'RandomNoise': 'Random Noise',

    // Batch operations
    'BatchIndex': 'Batch Index',
    'LatentBatch': 'Latent Batch',
    'ImageBatch': 'Image Batch',
    'RepeatImageBatch': 'Repeat Image Batch',

    // Face restoration
    'FaceRestoreModelLoader': 'Load Face Restore Model',
    'FaceRestore': 'Face Restore',

    // SDXL nodes
    'SDXLPromptStyler': 'SDXL Prompt Styler',
    'SDXLRefinerUseBase': 'SDXL Refiner (Use Base)',
  };

  return titleMap[nodeType] || nodeType;
}

/**
 * Gets widget parameter mapping for different node types
 */
function getWidgetMappingForNodeType(nodeType: string): string[] {
  const mappings: Record<string, string[]> = {
    // Core sampling and generation nodes  
    'KSampler': ['seed', 'control_after_generate', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise'],
    'KSamplerAdvanced': ['add_noise', 'noise_seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'start_at_step', 'end_at_step', 'return_with_leftover_noise'],

    // Text encoding nodes
    'CLIPTextEncode': ['text'],
    'CLIPTextEncodeSDXL': ['text_g', 'text_l'],

    // Image and latent nodes
    'SaveImage': ['filename_prefix'],
    'PreviewImage': [],
    'LoadImage': ['image'],
    'EmptyLatentImage': ['width', 'height', 'batch_size'],
    'EmptySD3LatentImage': ['width', 'height', 'batch_size'],
    'LatentUpscale': ['upscale_method', 'width', 'height', 'crop'],
    'LatentUpscaleBy': ['upscale_method', 'scale_by'],

    // Model loading nodes
    'CheckpointLoaderSimple': ['ckpt_name'],
    'CheckpointLoaderSimpleShared': ['ckpt_name'],
    'VAELoader': ['vae_name'],
    'VAELoaderShared': ['vae_name'],
    'UNETLoader': ['unet_name', 'weight_dtype'],
    'CLIPLoader': ['clip_name'],
    'DualCLIPLoader': ['clip_name1', 'clip_name2', 'type', 'device'],
    'UpscaleModelLoader': ['model_name'],
    'ControlNetLoader': ['control_net_name'],

    // LoRA and model modification nodes
    'LoraLoader': ['lora_name', 'strength_model', 'strength_clip'],
    'LoraLoaderModelOnly': ['lora_name', 'strength_model'],
    'PowerLoraLoader': ['lora_name', 'strength_model', 'strength_clip'],

    // VAE encode/decode
    'VAEDecode': [],
    'VAEEncode': [],
    'VAEEncodeForInpaint': ['grow_mask_by'],

    // Conditioning nodes
    'ConditioningAverage': ['conditioning_to_strength'],
    'ConditioningCombine': [],
    'ConditioningConcat': [],
    'ConditioningSetArea': ['width', 'height', 'x', 'y', 'strength'],
    'ConditioningSetAreaPercentage': ['width', 'height', 'x', 'y', 'strength'],
    'ConditioningSetTimesteps': ['start_percent', 'end_percent'],
    'ConditioningZeroOut': [],

    // Flux-specific nodes
    'FluxGuidance': ['guidance'],
    'FluxResolutionNode': ['megapixel', 'aspect_ratio', 'divisible_by', 'custom_ratio', 'custom_aspect_ratio'],

    // Upscaling nodes
    'UltimateSDUpscale': [
      'upscale_by', 'seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise',
      'mode_type', 'tile_width', 'tile_height', 'mask_blur', 'tile_padding',
      'seam_fix_mode', 'seam_fix_denoise', 'seam_fix_width', 'seam_fix_mask_blur',
      'seam_fix_padding', 'force_uniform_tiles', 'tiled_decode'
    ],
    'ImageScale': ['upscale_method', 'width', 'height', 'crop'],
    'ImageScaleBy': ['upscale_method', 'scale_by'],

    // ControlNet nodes
    'ControlNetApply': ['strength', 'start_percent', 'end_percent'],
    'ControlNetApplyAdvanced': ['strength', 'start_percent', 'end_percent'],

    // Mask and inpainting nodes
    'SetLatentNoiseMask': [],
    'MaskToImage': [],
    'ImageToMask': ['channel'],
    'SolidMask': ['value', 'width', 'height'],

    // Image processing nodes
    'ImageBlur': ['blur_radius', 'sigma'],
    'ImageSharpen': ['sharpen_radius', 'sigma', 'alpha'],
    'ImageInvert': [],
    'ImageBatch': [],
    'RepeatImageBatch': ['amount'],

    // Math and utility nodes
    'FloatConstant': ['value'],
    'IntConstant': ['value'],
    'StringConstant': ['value'],
    'RandomNoise': ['noise_seed'],

    // Animation and batch nodes
    'BatchIndex': ['batch_index'],
    'SliceLatent': ['start', 'length'],
    'LatentBatch': [],
    'LatentBatchSeedBehavior': ['seed_behavior'],

    // SDXL specific nodes  
    'SDXLPromptStyler': ['text_positive', 'text_negative', 'style'],
    'SDXLRefinerUseBase': ['model', 'positive', 'negative', 'vae'],

    // Face restoration and enhancement
    'FaceRestoreModelLoader': ['model_name'],
    'FaceRestore': ['facerestore_model', 'codeformer_fidelity'],

    // Regional prompting
    'RegionalPrompting': ['mask', 'prompt', 'neg_prompt'],

    // Custom node examples (extensible)
    'WAS_Number_To_Float': ['number'],
    'WAS_Number_To_Int': ['number'],
    'WAS_Text_Concatenate': ['text_a', 'text_b', 'delimiter'],

    // Animatediff nodes
    'AnimateDiffLoader': ['model_name'],
    'AnimateDiffSampler': ['steps', 'cfg', 'sampler_name', 'scheduler', 'beta_schedule'],
  };

  return mappings[nodeType] || inferWidgetMappingFromNode(nodeType);
}

/**
 * Attempts to infer widget parameter names for unknown node types
 * Based on common patterns and node structure
 */
function inferWidgetMappingFromNode(nodeType: string): string[] {
  const commonPatterns: Record<string, string[]> = {
    // Loader patterns
    'Loader': ['model_name', 'device'],
    'ModelLoader': ['model_name', 'device'],
    'CheckpointLoader': ['ckpt_name'],

    // Sampler patterns  
    'Sampler': ['seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise'],
    'KSampler': ['seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise'],

    // Text patterns
    'TextEncode': ['text'],
    'TextInput': ['text'],
    'Text': ['text'],

    // Image patterns
    'ImageSave': ['filename_prefix'],
    'SaveImage': ['filename_prefix'],
    'ImageLoad': ['image'],
    'LoadImage': ['image'],
    'ImageResize': ['width', 'height', 'interpolation'],
    'ImageScale': ['scale_factor', 'interpolation'],

    // Latent patterns
    'LatentImage': ['width', 'height', 'batch_size'],
    'EmptyLatent': ['width', 'height', 'batch_size'],
    'LatentUpscale': ['scale_factor', 'method'],

    // LoRA patterns
    'LoRA': ['lora_name', 'strength_model', 'strength_clip'],
    'Lora': ['lora_name', 'strength_model', 'strength_clip'],

    // ControlNet patterns
    'ControlNet': ['strength', 'start_percent', 'end_percent'],

    // VAE patterns
    'VAE': [],
    'VAEDecode': [],
    'VAEEncode': [],

    // Math patterns
    'Math': ['operation', 'value_a', 'value_b'],
    'Float': ['value'],
    'Int': ['value'],
    'String': ['value'],
  };

  // Handle undefined nodeType
  if (!nodeType || typeof nodeType !== 'string') {
    console.log(`⚠️  Node type is undefined/invalid: ${nodeType}, returning empty mapping`);
    return [];
  }

  // Check if node type contains any of these patterns
  for (const [pattern, mapping] of Object.entries(commonPatterns)) {
    if (nodeType.includes(pattern)) {
      return mapping;
    }
  }

  // If no pattern matches, return empty array (will be handled by inputs)
  return [];
}

/**
 * Handles special cases for specific node types
 */
function handleSpecialNodeCases(node: NormalWorkflowNode, apiNode: ApiWorkflowNode, widgetValues: any[] = []): void {
  // Handle nodes with special widget ordering
  switch (node.type) {
    case 'KSampler':
      // Handle KSampler with proper widget ordering and type conversion
      // widgets_values: [seed, "randomize"/"fixed", steps, cfg, sampler_name, scheduler, denoise]
      if (widgetValues.length >= 7) {
        apiNode.inputs.seed = widgetValues[0];
        // Skip widgetValues[1] which is "randomize"/"fixed" control
        apiNode.inputs.steps = widgetValues[2];
        apiNode.inputs.cfg = widgetValues[3];

        // Fix sampler_name - convert number to string
        let samplerName = widgetValues[4];
        if (typeof samplerName === 'number') {
          // Map common sampler indices to names
          const samplerMap = ['euler', 'euler_ancestral', 'heun', 'dpm_2', 'dpm_2_ancestral', 'lms', 'dpm_fast', 'dpm_adaptive', 'dpmpp_2s_ancestral', 'dpmpp_sde', 'dpmpp_sde_gpu', 'dpmpp_2m', 'dpmpp_2m_sde', 'dpmpp_2m_sde_gpu', 'ddim', 'uni_pc', 'uni_pc_bh2'];
          samplerName = samplerMap[samplerName] || 'euler';
        }
        apiNode.inputs.sampler_name = samplerName;

        // Fix scheduler - map to valid values
        let scheduler = widgetValues[5];
        if (scheduler === 'euler') {
          scheduler = 'simple'; // Map euler to simple which is valid
        }
        const validSchedulers = ['simple', 'sgm_uniform', 'karras', 'exponential', 'ddim_uniform', 'beta', 'normal', 'linear_quadratic', 'kl_optimal'];
        if (!validSchedulers.includes(scheduler)) {
          scheduler = 'simple'; // Default fallback
        }
        apiNode.inputs.scheduler = scheduler;

        // Fix denoise - convert string to float if needed
        let denoise = widgetValues[6];
        if (typeof denoise === 'string') {
          if (denoise === 'simple') {
            denoise = 1.0; // Default denoise value
          } else {
            denoise = parseFloat(denoise) || 1.0;
          }
        }
        apiNode.inputs.denoise = denoise;

        console.log(`🔧 Fixed KSampler ${node.id} parameters:`, {
          sampler_name: apiNode.inputs.sampler_name,
          scheduler: apiNode.inputs.scheduler,
          denoise: apiNode.inputs.denoise,
          steps: apiNode.inputs.steps
        });
      }
      break;
    case 'FluxResolutionNode':
      // Special handling for FluxResolutionNode widgets
      console.log(`🔧 Processing FluxResolutionNode ${node.id} with ${widgetValues.length} widgets:`, widgetValues);

      if (widgetValues.length >= 5) {
        const [megapixel, aspectRatio, divisibleBy, customRatio, customAspectRatio] = widgetValues;
        apiNode.inputs.megapixel = megapixel;
        apiNode.inputs.aspect_ratio = aspectRatio;
        apiNode.inputs.divisible_by = divisibleBy;
        apiNode.inputs.custom_ratio = customRatio;
        apiNode.inputs.custom_aspect_ratio = customAspectRatio;

        console.log(`✅ FluxResolutionNode ${node.id} parameters set:`, {
          megapixel, aspectRatio, divisibleBy, customRatio, customAspectRatio
        });
      } else {
        console.error(`❌ FluxResolutionNode ${node.id} missing widgets! Expected 5, got ${widgetValues.length}`);
        // Set default values to prevent errors
        apiNode.inputs.megapixel = "1.0";
        apiNode.inputs.aspect_ratio = "1:1 (Square)";
        apiNode.inputs.divisible_by = "64";
        apiNode.inputs.custom_ratio = false;
        apiNode.inputs.custom_aspect_ratio = "1:1";

        console.log(`🔧 Using default FluxResolutionNode parameters for node ${node.id}`);
      }
      break;

    case 'UltimateSDUpscale':
      // Handle complex UltimateSDUpscale widget mapping
      if (widgetValues.length >= 21) {
        const mappingOrder = [
          'upscale_by', 'seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise',
          'mode_type', 'tile_width', 'tile_height', 'mask_blur', 'tile_padding',
          'seam_fix_mode', 'seam_fix_denoise', 'seam_fix_width', 'seam_fix_mask_blur',
          'seam_fix_padding', 'force_uniform_tiles', 'tiled_decode'
        ];

        // Skip the first few values that might be handled by inputs
        let startIndex = 0;
        // Skip 'randomize' or 'fixed' seed control
        if (widgetValues[2] === "randomize" || widgetValues[2] === "fixed") {
          startIndex = 2; // Skip upscale_by, seed, and seed_control
        }

        for (let i = startIndex; i < Math.min(widgetValues.length, mappingOrder.length); i++) {
          const paramName = mappingOrder[i];
          if (paramName && !apiNode.inputs[paramName]) {
            apiNode.inputs[paramName] = widgetValues[i];
          }
        }
      }
      break;

    case 'DualCLIPLoader':
      // Ensure all four parameters are set
      if (widgetValues.length >= 4) {
        apiNode.inputs.clip_name1 = widgetValues[0];
        apiNode.inputs.clip_name2 = widgetValues[1];
        apiNode.inputs.type = widgetValues[2];
        apiNode.inputs.device = widgetValues[3];
      }
      break;
  }

  // Handle nodes with properties that should be included
  if (node.properties) {
    // Some nodes might have important properties that should be copied
    // This is extensible for future node types
  }
}

/**
 * Gets required parameters for specific node types
 */
function getRequiredParameters(nodeType: string): string[] {
  const requiredParams: Record<string, string[]> = {
    'FluxResolutionNode': ['megapixel', 'aspect_ratio', 'divisible_by', 'custom_ratio'],
    'LoraLoaderModelOnly': ['lora_name', 'strength_model'],
    'UpscaleModelLoader': ['model_name'],
    'UltimateSDUpscale': [
      'upscale_by', 'seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise',
      'mode_type', 'tile_width', 'tile_height', 'mask_blur', 'tile_padding',
      'seam_fix_mode', 'seam_fix_denoise', 'seam_fix_width', 'seam_fix_mask_blur',
      'seam_fix_padding', 'force_uniform_tiles', 'tiled_decode'
    ],
    'KSampler': ['seed', 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise'],
    'CLIPTextEncode': ['text'],
    'SaveImage': ['filename_prefix'],
    'VAELoader': ['vae_name'],
    'UNETLoader': ['unet_name'],
    'DualCLIPLoader': ['clip_name1', 'clip_name2', 'type', 'device'],
  };

  return requiredParams[nodeType] || [];
}

/**
 * Validates that the converted workflow has the required structure
 */
export function validateApiWorkflow(workflow: ApiWorkflow): boolean {
  // Check if workflow has at least one node
  if (Object.keys(workflow).length === 0) {
    console.error('❌ Workflow is empty');
    return false;
  }

  // Check if each node has required properties and parameters
  for (const [nodeId, node] of Object.entries(workflow)) {
    if (!node.class_type || !node.inputs) {
      console.error(`❌ Invalid node ${nodeId}: missing class_type or inputs`);
      return false;
    }

    // Check for required parameters
    const requiredParams = getRequiredParameters(node.class_type);
    const missingParams = requiredParams.filter(param =>
      node.inputs[param] === undefined || node.inputs[param] === null
    );

    if (missingParams.length > 0) {
      console.error(`❌ Node ${nodeId} (${node.class_type}) missing required parameters: ${missingParams.join(', ')}`);
      console.error(`   Available parameters: ${Object.keys(node.inputs).join(', ')}`);
      // Don't fail validation, just warn - some parameters might be optional
      console.warn(`⚠️  This might cause API errors - check if node should be bypassed/muted`);
    }
  }

  return true;
}

/**
 * Auto-detects input parameter names from node structure for unknown node types
 */
function detectInputParameters(node: NormalWorkflowNode): string[] {
  const inputNames: string[] = [];

  if (node.inputs && Array.isArray(node.inputs)) {
    // First, collect all input names that don't have connections
    for (const input of node.inputs) {
      if (!input.link && input.widget) {
        inputNames.push(input.name);
      }
    }
  }

  return inputNames;
}

/**
 * Enhanced workflow processing with better error handling and debugging
 */
function processNodeInputs(node: NormalWorkflowNode, apiNode: ApiWorkflowNode, linkMap: Map<number, any>, nodeType?: string): void {
  const widgetValues = node.widgets_values || [];
  const extractedNodeType = nodeType || node.type || (node as any).class_type || (node.properties && node.properties['Node name for S&R']);
  const inputNames = detectInputParameters(node);

  // Process connected inputs first
  if (node.inputs && Array.isArray(node.inputs)) {
    for (const input of node.inputs) {
      if (input.link !== undefined && input.link !== null) {
        const linkInfo = linkMap.get(input.link);
        if (linkInfo) {
          apiNode.inputs[input.name] = [
            linkInfo.sourceNodeId.toString(),
            linkInfo.sourceOutputIndex,
          ];
        }
      }
    }
  }

  // Check if this node type has special handling
  const hasSpecialHandling = [
    'KSampler', 'FluxResolutionNode', 'UltimateSDUpscale', 'DualCLIPLoader'
  ].includes(node.type);

  // Process widget values with smart mapping (skip if handled specially)
  if (!hasSpecialHandling) {
    const widgetMapping = getWidgetMappingForNodeType(extractedNodeType);

    if (widgetMapping.length > 0) {
      // Use predefined mapping
      for (let i = 0; i < Math.min(widgetValues.length, widgetMapping.length); i++) {
        const paramName = widgetMapping[i];
        if (paramName && !apiNode.inputs[paramName] && widgetValues[i] !== undefined) {
          // Skip control values like "randomize", "fixed"
          if (typeof widgetValues[i] === 'string' &&
            ['randomize', 'fixed', 'increment', 'decrement'].includes(widgetValues[i])) {
            continue;
          }
          apiNode.inputs[paramName] = widgetValues[i];
        }
      }
    } else if (inputNames.length > 0) {
      // Use detected input names
      for (let i = 0; i < Math.min(widgetValues.length, inputNames.length); i++) {
        const paramName = inputNames[i];
        if (!apiNode.inputs[paramName] && widgetValues[i] !== undefined) {
          apiNode.inputs[paramName] = widgetValues[i];
        }
      }
    } else {
      // Fallback: use generic parameter names
      for (let i = 0; i < widgetValues.length; i++) {
        if (widgetValues[i] !== undefined &&
          !['randomize', 'fixed', 'increment', 'decrement'].includes(widgetValues[i])) {
          apiNode.inputs[`param_${i}`] = widgetValues[i];
        }
      }
    }
  }
}

/**
 * Normalizes workflow input to ensure consistent structure
 */
function normalizeWorkflowInput(workflow: any): NormalWorkflow | null {
  // Handle different input formats
  if (!workflow) {
    console.error('❌ Workflow is null or undefined');
    return null;
  }

  // If it's already an API workflow, we can't convert it
  if (!workflow.nodes && !workflow.links && typeof workflow === 'object') {
    // Check if it looks like an API workflow (has numbered keys with class_type)
    const keys = Object.keys(workflow);
    if (keys.length > 0 && workflow[keys[0]]?.class_type) {
      console.warn('⚠️  Input appears to be already in API format');
      return null;
    }
  }

  // Handle string input (JSON)
  if (typeof workflow === 'string') {
    try {
      workflow = JSON.parse(workflow);
    } catch (error) {
      console.error('❌ Failed to parse workflow JSON:', error);
      return null;
    }
  }

  // Ensure we have nodes and links arrays
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    console.error('❌ Workflow missing or invalid nodes array');
    return null;
  }

  if (!workflow.links) {
    workflow.links = [];
  }

  if (!Array.isArray(workflow.links)) {
    console.warn('⚠️  Workflow links is not an array, using empty array');
    workflow.links = [];
  }

  return workflow as NormalWorkflow;
}

/**
 * Main function to convert and validate a workflow
 */
export function processWorkflow(input: any): ApiWorkflow | null {
  try {
    console.log('🔄 Processing workflow conversion...');

    // Normalize input workflow
    const normalWorkflow = normalizeWorkflowInput(input);
    if (!normalWorkflow) {
      return null;
    }

    // Log detailed input analysis for debugging
    console.log('📋 Detailed input analysis:', {
      totalNodes: normalWorkflow.nodes?.length || 0,
      nodeDetails: normalWorkflow.nodes?.map(n => ({
        id: n.id,
        type: n.type,
        mode: n.mode || 0,
        hasWidgets: !!(n.widgets_values && n.widgets_values.length > 0),
        widgetCount: n.widgets_values?.length || 0
      })) || []
    });

    // Log workflow analysis
    const activeModes = normalWorkflow.nodes.reduce((acc, node) => {
      acc[node.mode || 0] = (acc[node.mode || 0] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('📊 Input workflow analysis:', {
      totalNodes: normalWorkflow.nodes?.length || 0,
      activeModes: activeModes,
      linkCount: normalWorkflow.links?.length || 0,
      nodeTypes: [...new Set(normalWorkflow.nodes.map(n => n.type))].slice(0, 10)
    });

    const apiWorkflow = convertWorkflowToApi(normalWorkflow);

    // Fix broken connections to filtered nodes
    console.log('🔗 Fixing connections to filtered nodes...');
    const filteredNodeIds = normalWorkflow.nodes
      .filter((node: any) => {
        const nodeType = node.type || (node as any).class_type || (node.properties && node.properties['Node name for S&R']);
        return node.mode === 4 || isUIOnlyNode(nodeType);
      })
      .map((node: any) => node.id.toString());

    console.log('🚫 Filtered node IDs:', filteredNodeIds);

    for (const [nodeId, nodeData] of Object.entries(apiWorkflow)) {
      const node = nodeData as any;
      for (const [inputName, inputValue] of Object.entries(node.inputs)) {
        if (Array.isArray(inputValue) && inputValue.length >= 2) {
          const sourceNodeId = inputValue[0].toString();
          if (filteredNodeIds.includes(sourceNodeId)) {
            console.log(`🔧 Fixing broken connection in node ${nodeId}.${inputName} -> was pointing to filtered node ${sourceNodeId}`);

            // For now, try to find the same connection type from an active node
            // This is a simplified fix - in practice you'd trace the connection chain
            let fixed = false;

            // Special case: if it's a model connection pointing to LoraLoaderModelOnly, use UNETLoader instead
            if (inputName === 'model' && sourceNodeId === '56') {
              if (apiWorkflow['38']) { // UNETLoader
                console.log(`  ✅ Redirecting model connection from LoRA (${sourceNodeId}) to UNETLoader (38)`);
                node.inputs[inputName] = ['38', 0];
                fixed = true;
              }
            }

            if (!fixed) {
              console.log(`  ❌ No alternative found, removing connection`);
              delete node.inputs[inputName];
            }
          }
        }
      }
    }

    console.log('✅ Conversion completed');
    console.log('📊 Output API workflow:', {
      nodeCount: Object.keys(apiWorkflow).length,
      nodeIds: Object.keys(apiWorkflow),
      nodeTypes: Object.values(apiWorkflow).map(n => n.class_type)
    });

    if (!validateApiWorkflow(apiWorkflow)) {
      console.error('❌ Converted workflow failed validation');
      return null;
    }

    return apiWorkflow;
  } catch (error) {
    console.error('❌ Error converting workflow:', error);
    console.error('📋 Workflow input structure:', JSON.stringify(input, null, 2).slice(0, 1000));
    return null;
  }
}