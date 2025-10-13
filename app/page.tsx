'use client';

import { useImageGeneration } from '../hooks';
import { ImageGenerationForm, GeneratedImagesDisplay, GenerationProgress } from '../components';
import { GeneratedImage } from '../types';

export default function Home() {
  const {
    isGenerating,
    progress,
    generatedImages,
    error,
    generateImage,
    resetGeneration,
  } = useImageGeneration();

  // Helper function to generate image URLs
  const getImageUrl = (image: GeneratedImage) => {
    const params = new URLSearchParams({
      filename: image.filename,
      type: image.type,
      subfolder: image.subfolder || ''
    });
    return `/api/view?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pb-12">
      {/* Hero Section */}
      <section className="container mx-auto px-6">
        <div className="text-center">
          <div className='pt-12'>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI Image
              <span className="block text-purple-400">Generator</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Créez des images uniques avec l&apos;intelligence artificielle <br />
              <span className="text-purple-400">Entrez votre prompt et laissez la magie opérer !</span>
            </p>
          </div>

          {/* Hero Image or Generated Images */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <GeneratedImagesDisplay
                images={generatedImages}
                getImageUrl={getImageUrl}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Image Generation Form Section */}
      <section className="container mx-auto px-6 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Progress Display */}
            <GenerationProgress progress={progress} />

            {/* Form */}
            <ImageGenerationForm
              onGenerate={generateImage}
              isGenerating={isGenerating}
              error={error}
            />

            {/* Reset Button */}
            {(generatedImages.length > 0 || error) && (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
                <button
                  onClick={resetGeneration}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Nouvelle génération
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
