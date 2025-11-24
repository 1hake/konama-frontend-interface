/**
 * FunnelStepViewer Component
 * 
 * Grid display of images with selection capabilities
 */

'use client';

import { FunnelImage } from '@/types/funnel';

interface FunnelStepViewerProps {
  images: FunnelImage[];
  selectedImageIds: string[];
  onSelectionChange: (imageIds: string[]) => void;
  getImageUrl: (image: FunnelImage) => string;
  onImageClick?: (image: FunnelImage) => void;
}

export function FunnelStepViewer({
  images,
  selectedImageIds,
  onSelectionChange,
  getImageUrl,
  onImageClick,
}: FunnelStepViewerProps) {
  const toggleImage = (imageId: string) => {
    if (selectedImageIds.includes(imageId)) {
      onSelectionChange(selectedImageIds.filter(id => id !== imageId));
    } else {
      onSelectionChange([...selectedImageIds, imageId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(images.map(img => img.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  if (images.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-16 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-3xl flex items-center justify-center">
          <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white/40 font-medium">No images in this step yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Selection Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-medium text-white/50">
          {selectedImageIds.length} of {images.length} selected
        </div>
        <div className="flex gap-1">
          <button
            onClick={selectAll}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors px-4 py-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-sm font-medium text-white/40 hover:text-white/60 transition-colors px-4 py-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {images.map((image) => {
          const isSelected = selectedImageIds.includes(image.id);
          return (
            <div
              key={image.id}
              className={`relative group bg-white/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden border transition-all duration-200 ${isSelected
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[0.98]'
                  : 'border-white/[0.08] hover:border-white/20 hover:shadow-xl'
                }`}
            >
              {/* Image - Click to toggle selection */}
              <div
                className="aspect-square bg-black/10 cursor-pointer overflow-hidden"
                onClick={() => toggleImage(image.id)}
              >
                <img
                  src={getImageUrl(image)}
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Selection Indicator */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected
                      ? 'bg-blue-500 shadow-lg shadow-blue-500/40 scale-110'
                      : 'bg-black/40 backdrop-blur-md border border-white/30'
                    }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Workflow Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xl rounded-full text-xs font-medium text-white/80 border border-white/10">
                  {image.workflowId}
                </span>
              </div>

              {/* Info Overlay (on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-white/90 line-clamp-2 mb-1.5 font-medium">
                    {image.prompt}
                  </p>
                  <p className="text-xs text-white/50 font-mono">
                    Seed: {image.seed}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
