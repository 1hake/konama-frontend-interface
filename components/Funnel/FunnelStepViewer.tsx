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
      <div className="glass rounded-2xl border border-white/10 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white/60">No images in this step yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-white/60">
          {selectedImageIds.length} of {images.length} selected
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors px-3 py-1"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-sm text-white/40 hover:text-white/60 transition-colors px-3 py-1"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => {
          const isSelected = selectedImageIds.includes(image.id);
          return (
            <div
              key={image.id}
              className={`relative group glass rounded-xl overflow-hidden border-2 transition-all ${isSelected
                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                : 'border-white/10 hover:border-white/30'
                }`}
            >
              {/* Image - Click to toggle selection */}
              <div
                className="aspect-square bg-black/20 cursor-pointer"
                onClick={() => toggleImage(image.id)}
              >
                <img
                  src={getImageUrl(image)}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Selection Indicator */}
              <div className="absolute top-2 left-2 z-10 pointer-events-none">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                    ? 'bg-purple-500 border-purple-500'
                    : 'bg-black/50 border-white/40'
                    }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Workflow Badge */}
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white/80">
                  {image.workflowId}
                </span>
              </div>

              {/* Info Overlay (on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white/80 line-clamp-2 mb-1">
                    {image.prompt}
                  </p>
                  <p className="text-xs text-white/40">
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
