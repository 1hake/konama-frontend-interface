# Backend /prompt Endpoint - Payload Format Confirmation

## ✅ Confirmed Format

The system sends **exactly** this format to your backend `/prompt` endpoint:

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
        "pos": [300.208984375, 53.8828125],
        "size": [419.8125, 147.453125],
        "flags": {},
        "order": 2,
        "mode": 0,
        "inputs": [
          {
            "name": "clip",
            "type": "CLIP",
            "link": 3
          }
        ],
        "outputs": [
          {
            "name": "CONDITIONING",
            "type": "CONDITIONING",
            "slot_index": 0,
            "links": [4]
          }
        ],
        "properties": {
          "Node name for S&R": "CLIPTextEncode"
        },
        "widgets_values": [
          "USER'S POSITIVE PROMPT INJECTED HERE"
        ]
      },
      {
        "id": 7,
        "type": "CLIPTextEncode",
        "pos": [301.3270484375, 259.22444960937503],
        "size": [422.25, 147.453125],
        "flags": {},
        "order": 3,
        "mode": 0,
        "inputs": [
          {
            "name": "clip",
            "type": "CLIP",
            "link": 5
          }
        ],
        "outputs": [
          {
            "name": "CONDITIONING",
            "type": "CONDITIONING",
            "slot_index": 0,
            "links": [6]
          }
        ],
        "properties": {
          "Node name for S&R": "CLIPTextEncode"
        },
        "widgets_values": [
          "USER'S NEGATIVE PROMPT INJECTED HERE"
        ]
      },
      {
        "id": 5,
        "type": "EmptyLatentImage",
        "pos": [286.06130996093736, 479.42715000000027],
        "size": [444, 200.953125],
        "flags": {},
        "order": 0,
        "mode": 0,
        "inputs": [],
        "outputs": [
          {
            "name": "LATENT",
            "type": "LATENT",
            "slot_index": 0,
            "links": [2]
          }
        ],
        "properties": {
          "Node name for S&R": "EmptyLatentImage"
        },
        "widgets_values": [512, 512, 1]
      },
      {
        "id": 3,
        "type": "KSampler",
        "pos": [768.7919509765626, 53.28407695312502],
        "size": [444, 398.921875],
        "flags": {},
        "order": 4,
        "mode": 0,
        "inputs": [
          {
            "name": "model",
            "type": "MODEL",
            "link": 1
          },
          {
            "name": "positive",
            "type": "CONDITIONING",
            "link": 4
          },
          {
            "name": "negative",
            "type": "CONDITIONING",
            "link": 6
          },
          {
            "name": "latent_image",
            "type": "LATENT",
            "link": 2
          }
        ],
        "outputs": [
          {
            "name": "LATENT",
            "type": "LATENT",
            "slot_index": 0,
            "links": [7]
          }
        ],
        "properties": {
          "Node name for S&R": "KSampler"
        },
        "widgets_values": [
          376909247930455,
          "randomize",
          20,
          8,
          "euler",
          "normal",
          1
        ]
      },
      {
        "id": 8,
        "type": "VAEDecode",
        "pos": [778.0570142578127, 508.79139335937515],
        "size": [207, 106.96875],
        "flags": {},
        "order": 5,
        "mode": 0,
        "inputs": [
          {
            "name": "samples",
            "type": "LATENT",
            "link": 7
          },
          {
            "name": "vae",
            "type": "VAE",
            "link": 8
          }
        ],
        "outputs": [
          {
            "name": "IMAGE",
            "type": "IMAGE",
            "slot_index": 0,
            "links": [9]
          }
        ],
        "properties": {
          "Node name for S&R": "VAEDecode"
        },
        "widgets_values": []
      },
      {
        "id": 9,
        "type": "SaveImage",
        "pos": [1035.1199468750012, 506.72242031250033],
        "size": [444, 270],
        "flags": {},
        "order": 6,
        "mode": 0,
        "inputs": [
          {
            "name": "images",
            "type": "IMAGE",
            "link": 9
          }
        ],
        "outputs": [],
        "properties": {},
        "widgets_values": ["ComfyUI"]
      },
      {
        "id": 4,
        "type": "CheckpointLoaderSimple",
        "pos": [-211.72374532470704, 264.5544275390632],
        "size": [444, 180.96875],
        "flags": {},
        "order": 1,
        "mode": 0,
        "inputs": [],
        "outputs": [
          {
            "name": "MODEL",
            "type": "MODEL",
            "slot_index": 0,
            "links": [1]
          },
          {
            "name": "CLIP",
            "type": "CLIP",
            "slot_index": 1,
            "links": [3, 5]
          },
          {
            "name": "VAE",
            "type": "VAE",
            "slot_index": 2,
            "links": [8]
          }
        ],
        "properties": {
          "Node name for S&R": "CheckpointLoaderSimple"
        },
        "widgets_values": ["v1-5-pruned-emaonly-fp16.safetensors"]
      }
    ],
    "links": [
      [1, 4, 0, 3, 0, "MODEL"],
      [2, 5, 0, 3, 3, "LATENT"],
      [3, 4, 1, 6, 0, "CLIP"],
      [4, 6, 0, 3, 1, "CONDITIONING"],
      [5, 4, 1, 7, 0, "CLIP"],
      [6, 7, 0, 3, 2, "CONDITIONING"],
      [7, 3, 0, 8, 0, "LATENT"],
      [8, 4, 2, 8, 1, "VAE"],
      [9, 8, 0, 9, 0, "IMAGE"]
    ],
    "groups": [],
    "config": {},
    "extra": {
      "ds": {
        "scale": 0.6830134553650705,
        "offset": [613.605055859375, 548.7392707031252]
      },
      "frontendVersion": "1.32.0"
    },
    "version": 0.4
  },
  "comfyClientId": "web-client-1733159123456-abc123"
}
```

## 📋 Payload Structure Breakdown

```typescript
{
  workflow_id: string,        // e.g., "basic-wf-test"
  mode: "slow" | "fast",      // Generation mode
  prompt: {                   // Complete ComfyUI workflow structure
    id: string,               // Workflow UUID
    revision: number,         // Version number
    last_node_id: number,     // Highest node ID
    last_link_id: number,     // Highest link ID
    nodes: [...],             // Array of workflow nodes (with injected prompts)
    links: [...],             // Array of node connections
    groups: [...],            // Node groupings
    config: {},               // Workflow configuration
    extra: {...},             // Extra metadata
    version: number           // ComfyUI version
  },
  comfyClientId: string       // Unique client identifier
}
```

## ✅ What Gets Injected

When a user enters:
- **Positive prompt**: `"A beautiful sunset over mountains"`
- **Negative prompt**: `"blurry, low quality"`

The system:
1. Finds CLIPTextEncode nodes (id: 6 and 7 in this example)
2. Replaces `widgets_values` arrays:
   - Node 6: `["A beautiful sunset over mountains"]`
   - Node 7: `["blurry, low quality"]`
3. Keeps all other workflow structure intact

## 🔍 How to Verify

### In Browser Console
```javascript
// After submitting, check the Network tab
// Look for POST to /api/submit-workflow
// You'll see exactly this payload format
```

### In Server Logs
```javascript
// Your backend /prompt endpoint receives:
console.log('Received payload:', req.body);
// Output matches the format above
```

## 🎯 Key Points

✅ **Top-level fields**: `workflow_id`, `mode`, `prompt`, `comfyClientId`
✅ **`prompt` field**: Contains the complete workflow structure
✅ **Prompts injected**: Into CLIPTextEncode `widgets_values` arrays
✅ **All other nodes**: Preserved exactly as in original workflow
✅ **Links preserved**: All node connections maintained
✅ **Metadata preserved**: `extra`, `config`, etc. kept intact

The system is already configured to send this exact format! 🎉
