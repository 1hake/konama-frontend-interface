'use client';

import Image from 'next/image';
import { GeneratedImagesDisplayProps } from '../types';

export const GeneratedImagesDisplay: React.FC<GeneratedImagesDisplayProps> = ({
    images,
    getImageUrl
}) => {
    if (images.length === 0) {
        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center py-8">
                <div className="text-center space-y-4">
                    <div className="w-32 h-32 md:w-48 md:h-48 mx-auto bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-full flex items-center justify-center border-4 border-purple-500/30">
                        <svg className="w-16 h-16 md:w-24 md:h-24 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-gray-300 text-lg md:text-xl font-semibold">Aucune image générée</p>
                        <p className="text-gray-500 text-sm md:text-base mt-2">Remplissez le formulaire et cliquez sur &quot;Générer&quot;</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
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
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Télécharger
                                </a>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(getImageUrl(image));
                                    }}
                                    className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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