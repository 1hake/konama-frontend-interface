# Image Generation Admin - Project Structure

This project has been restructured into a clean, modular architecture with separation of concerns. Here's an overview of the new structure:

## 📁 Directory Structure

```
image-generation-admin/
├── app/                          # Next.js 13+ App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main page component
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── ImageGenerationForm.tsx  # Form for prompt input and settings
│   ├── GeneratedImagesDisplay.tsx # Display and manage generated images
│   ├── GenerationProgress.tsx   # Progress indicator component
│   └── index.ts                 # Component exports
├── hooks/                       # Custom React hooks
│   ├── useImageGeneration.ts    # Main hook for image generation logic
│   └── index.ts                 # Hook exports
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Shared interfaces and types
└── public/                      # Static assets
    ├── icon.svg                 # Custom SVG favicon
    └── images/                  # Image assets
```

## 🧩 Components

### 🎨 ImageGenerationForm
**Location:** `components/ImageGenerationForm.tsx`

A comprehensive form component that handles:
- Prompt and negative prompt inputs
- Style, quality, and lighting quick selectors
- Form validation and submission
- Loading states and error display

**Props:**
- `onGenerate`: Function to call when generating images
- `isGenerating`: Boolean indicating if generation is in progress
- `error`: Error message to display

### 🖼️ GeneratedImagesDisplay
**Location:** `components/GeneratedImagesDisplay.tsx`

Displays generated images with features:
- Responsive grid layout
- Download functionality for each image
- Copy URL to clipboard
- Image metadata display
- Fallback to hero image when no images are generated

**Props:**
- `images`: Array of generated images
- `getImageUrl`: Function to construct image URLs

### 📊 GenerationProgress
**Location:** `components/GenerationProgress.tsx`

Shows real-time generation progress:
- Queue status (queued, executing, completed, error)
- Progress bar with percentage
- Current processing node information
- Error messages

**Props:**
- `progress`: Progress object with status and metrics

## 🎣 Hooks

### 🚀 useImageGeneration
**Location:** `hooks/useImageGeneration.ts`

Main hook that handles all image generation logic:
- **WebSocket connection** for real-time updates
- **API calls** to ComfyUI backend
- **Workflow creation** with Stable Diffusion pipeline
- **Progress tracking** and polling
- **Error handling** and state management

**Returns:**
- `isGenerating`: Boolean indicating generation state
- `progress`: Current progress information
- `generatedImages`: Array of generated images
- `error`: Error message if any
- `generateImage`: Function to start generation
- `resetGeneration`: Function to reset all states

## 🔧 Types

### 📋 Core Interfaces
**Location:** `types/index.ts`

- **GenerationProgress**: Progress tracking interface
- **GeneratedImage**: Image metadata interface
- **ImageGenerationHookReturn**: Hook return type
- **Component Props**: Props for all components

## 🔄 Data Flow

1. **User Interaction**: User fills form in `ImageGenerationForm`
2. **Hook Processing**: `useImageGeneration` processes the request
3. **API Communication**: Hook calls ComfyUI API endpoints
4. **Real-time Updates**: WebSocket provides progress updates
5. **State Management**: Hook manages all generation state
6. **UI Updates**: Components reactively update based on state
7. **Image Display**: `GeneratedImagesDisplay` shows results

## 🎯 Benefits of New Structure

### ✅ **Separation of Concerns**
- **Logic**: Isolated in custom hooks
- **UI**: Pure presentation components  
- **Types**: Centralized type definitions

### ♻️ **Reusability**
- Components can be reused in different contexts
- Hooks can be shared across components
- Clean, testable code structure

### 🧪 **Maintainability**
- Easy to test individual components
- Clear dependencies and data flow
- Modular architecture for scaling

### 📊 **Performance**
- Optimized re-renders with proper state management
- Memoized callbacks in hooks
- Efficient WebSocket handling

## 🚀 Usage

### Environment Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your RunPod endpoint:**
   ```bash
   # .env.local
   NEXT_PUBLIC_COMFY_API_URL=https://your-runpod-url.proxy.runpod.net
   ```

3. **For local development:**
   ```bash
   # .env.local
   NEXT_PUBLIC_COMFY_API_URL=http://localhost:8188
   ```

### Component Usage

```tsx
// Main page usage
import { useImageGeneration } from '../hooks';
import { ImageGenerationForm, GeneratedImagesDisplay, GenerationProgress } from '../components';

export default function Page() {
  const {
    isGenerating,
    progress,
    generatedImages,
    error,
    generateImage,
    resetGeneration,
  } = useImageGeneration();

  return (
    <div>
      <GenerationProgress progress={progress} />
      <ImageGenerationForm onGenerate={generateImage} isGenerating={isGenerating} error={error} />
      <GeneratedImagesDisplay images={generatedImages} getImageUrl={getImageUrl} />
    </div>
  );
}
```

## 🌐 API Configuration

The application automatically detects whether you're using:
- **External API** (RunPod): Direct API calls to your configured endpoint
- **Local/Proxy**: Relative API calls through your local server or proxy

### Environment Variables

- `NEXT_PUBLIC_COMFY_API_URL`: The base URL for your ComfyUI API
  - **RunPod**: `https://your-id.proxy.runpod.net`
  - **Local**: `http://localhost:8188`
  - **Not set**: Uses relative paths (proxy mode)

The hook automatically handles:
- **API endpoint construction** based on environment
- **WebSocket URL generation** for real-time updates
- **Fallback behavior** for different deployment scenarios

This structure follows React best practices and makes the codebase much more maintainable and scalable! 🎉