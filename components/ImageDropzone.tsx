'use client';

import { useState, useCallback, useRef } from 'react';

interface ImageDropzoneProps {
    onImageUpload: (file: File, previewUrl: string) => void;
    onImageRemove: () => void;
    uploadedImage?: { file: File; previewUrl: string } | null;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
    onImageUpload,
    onImageRemove,
    uploadedImage
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            onImageUpload(file, previewUrl);
        }
    }, [onImageUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onImageRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onImageRemove]);

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {uploadedImage ? (
                // Image preview state
                <div className="relative group">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
                        <img
                            src={uploadedImage.previewUrl}
                            alt="Input preview"
                            className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Remove button */}
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
                            title="Remove image"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Info overlay */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="glass-light rounded-lg px-3 py-1.5 text-xs text-white/90 truncate border border-white/20">
                                📎 {uploadedImage.file.name}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Dropzone state
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer
                        transition-all duration-300 transform hover:scale-[1.01]
                        ${isDragging
                            ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 scale-[1.01]'
                            : 'border-white/20 bg-gradient-to-br from-white/5 to-white/10 hover:border-purple-400/50 hover:from-purple-500/10 hover:to-pink-500/10'
                        }
                    `}
                >
                    <div className="px-6 py-8 text-center">
                        {/* Icon */}
                        <div className="mx-auto w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <svg
                                className={`w-6 h-6 transition-all duration-300 ${isDragging ? 'text-purple-400 scale-110' : 'text-white/60'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div className="space-y-1">
                            <p className={`text-sm font-medium transition-colors duration-300 ${isDragging ? 'text-purple-300' : 'text-white/80'}`}>
                                {isDragging ? 'Déposez votre image' : 'Ajouter une image'}
                            </p>
                            <p className="text-xs text-white/50">
                                Glissez-déposez ou cliquez
                            </p>
                        </div>
                    </div>

                    {/* Animated border gradient on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse" />
                    </div>
                </div>
            )}
        </div>
    );
};
