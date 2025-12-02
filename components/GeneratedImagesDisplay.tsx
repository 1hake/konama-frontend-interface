'use client';

import Image from 'next/image';
import { GeneratedImagesDisplayProps, GenerationProgress } from '../types';

interface ExtendedGeneratedImagesDisplayProps extends GeneratedImagesDisplayProps {
    progress?: GenerationProgress | null;
    isGenerating?: boolean;
}

export const GeneratedImagesDisplay: React.FC<
    ExtendedGeneratedImagesDisplayProps
> = ({ images, getImageUrl, progress, isGenerating }) => {
    // Show progress if generating and no images yet
    if (isGenerating && images.length === 0 && progress) {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center py-12 space-y-6">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-4 border-blue-500/30 animate-pulse">
                        <svg
                            className="w-16 h-16 text-blue-400 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <p className="text-white text-lg font-semibold">
                            {progress.status === 'queued' &&
                                '⏳ En attente dans la file...'}
                            {progress.status === 'executing' &&
                                `🎨 Génération en cours${progress.node ? ` (${progress.node})` : ''}...`}
                            {progress.status === 'completed' &&
                                '✅ Génération terminée !'}
                            {progress.status === 'error' &&
                                '❌ Erreur lors de la génération'}
                        </p>
                        {progress.progress !== undefined && (
                            <p className="text-blue-300 text-sm font-medium">
                                {Math.round(progress.progress)}%
                            </p>
                        )}
                    </div>

                    {progress.progress !== undefined && (
                        <div className="w-full max-w-xs mx-auto">
                            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-blue-500/30">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50"
                                    style={{ width: `${progress.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {progress.error && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-300 text-sm">
                                ⚠️ {progress.error}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center py-16">
                <div className="text-center space-y-6">
                    {/* Organic Ferrofluid Animation */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
                        {/* Outer magnetic field ripples */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 animate-ripple-wave blur-2xl"></div>
                        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-pink-500/15 via-blue-500/15 to-purple-500/15 animate-ripple-wave blur-xl" style={{ animationDelay: '1.2s' }}></div>
                        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-blue-500/15 animate-ripple-wave blur-lg" style={{ animationDelay: '2.4s' }}></div>
                        
                        {/* Magnetic particles drifting in field */}
                        <div className="absolute inset-8">
                            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400/80 rounded-full blur-sm animate-magnetic-drift shadow-lg shadow-blue-500/50"></div>
                            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400/80 rounded-full blur-sm animate-magnetic-drift shadow-lg shadow-purple-500/50" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute bottom-1/3 left-1/2 w-3.5 h-3.5 bg-pink-400/80 rounded-full blur-sm animate-magnetic-drift shadow-lg shadow-pink-500/50" style={{ animationDelay: '2s' }}></div>
                            <div className="absolute bottom-1/4 right-1/3 w-2.5 h-2.5 bg-cyan-400/80 rounded-full blur-sm animate-magnetic-drift shadow-lg shadow-cyan-500/50" style={{ animationDelay: '3s' }}></div>
                            <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-indigo-400/80 rounded-full blur-sm animate-magnetic-drift shadow-lg shadow-indigo-500/50" style={{ animationDelay: '4s' }}></div>
                        </div>
                        
                        {/* Main ferrofluid blob with spiky morphing */}
                        <div className="absolute inset-10 animate-ferrofluid-morph overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-blue-500/50 via-purple-500/60 to-pink-500/50 backdrop-blur-sm animate-color-flow shadow-2xl shadow-purple-500/60"></div>
                        </div>
                        
                        {/* Coral red accent layer */}
                        <div className="absolute inset-12 animate-spike-emerge overflow-hidden" style={{ animationDelay: '0.8s' }}>
                            <div className="w-full h-full bg-gradient-to-br from-[#FD5245]/60 via-[#FD5245]/50 to-pink-500/40 backdrop-blur-sm shadow-2xl shadow-[#FD5245]/50"></div>
                        </div>
                        
                        {/* Secondary spike layer */}
                        <div className="absolute inset-14 animate-spike-emerge overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-purple-400/40 via-pink-400/50 to-blue-400/40 backdrop-blur-md shadow-xl shadow-pink-500/50"></div>
                        </div>
                        
                        {/* Inner fluid waves */}
                        <div className="absolute inset-20 rounded-full bg-gradient-to-br from-blue-300/50 via-purple-300/60 to-pink-300/50 animate-fluid-wave blur-md"></div>
                        <div className="absolute inset-24 rounded-full bg-gradient-to-br from-pink-300/60 via-blue-300/70 to-purple-300/60 animate-fluid-wave blur-sm" style={{ animationDelay: '1.3s' }}></div>
                        
                        {/* Core magnetic pulse */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-white/60 via-blue-200/70 to-purple-200/60 rounded-full animate-magnetic-pulse blur-md shadow-2xl shadow-white/30"></div>
                        </div>
                    </div>
                    
                  
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            {images.map((image, index) => (
                <div key={index} className="relative group">
                    <div className="relative overflow-hidden rounded-xl shadow-2xl bg-gray-900">
                        <Image
                            src={getImageUrl(image)}
                            alt={`Generated image ${index + 1}`}
                            width={1024}
                            height={1024}
                            className="w-full h-auto transition-transform group-hover:scale-[1.02] duration-500"
                            style={{ objectFit: 'contain' }}
                        />

                        {/* Overlay with download button */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
                            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <a
                                    href={getImageUrl(image)}
                                    download={image.filename}
                                    className="flex-1 bg-white text-black px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Télécharger
                                </a>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            getImageUrl(image)
                                        );
                                    }}
                                    className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                    </svg>
                                    Copier
                                </button>
                            </div>
                        </div>

                        {/* Image counter badge */}
                        <div className="absolute top-4 right-4">
                            <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/20">
                                {index + 1} / {images.length}
                            </span>
                        </div>
                    </div>

                    {/* Image info */}
                    <div className="mt-2 px-2 text-sm text-gray-400 space-y-1">
                        <p className="truncate flex items-center gap-2">
                            <span className="text-gray-500">📄</span>
                            <span className="font-mono">{image.filename}</span>
                        </p>
                        {image.subfolder && (
                            <p className="truncate flex items-center gap-2">
                                <span className="text-gray-500">📁</span>
                                <span>{image.subfolder}</span>
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
