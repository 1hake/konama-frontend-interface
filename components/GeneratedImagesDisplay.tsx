'use client';

import Image from 'next/image';
import { GeneratedImagesDisplayProps } from '../types';

export const GeneratedImagesDisplay: React.FC<GeneratedImagesDisplayProps> = ({
    images,
    getImageUrl
}) => {
    if (images.length === 0) {
        return (
            <div className="relative mt-8 mb-16">
                <Image
                    src="/images/hero-image.svg"
                    alt="AI Image Generation"
                    width={600}
                    height={400}
                    className="mx-auto"
                    priority
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {images.map((image, index) => (
                <div key={index} className="relative group">
                    <div className="relative overflow-hidden rounded-lg shadow-xl">
                        <Image
                            src={getImageUrl(image)}
                            alt={`Generated image ${index + 1}`}
                            width={512}
                            height={512}
                            className="transition-transform group-hover:scale-105 duration-300"
                            style={{ objectFit: 'cover' }}
                        />

                        {/* Overlay with download button */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                                <a
                                    href={getImageUrl(image)}
                                    download={image.filename}
                                    className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
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
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                    </svg>
                                    Copier URL
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image info */}
                    <div className="mt-2 text-sm text-gray-400">
                        <p className="truncate">Fichier: {image.filename}</p>
                        {image.subfolder && (
                            <p className="truncate">Dossier: {image.subfolder}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};