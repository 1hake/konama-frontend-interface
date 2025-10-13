'use client';

import { GenerationProgress as GenerationProgressType } from '../types';

interface GenerationProgressProps {
    progress: GenerationProgressType | null;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
    if (!progress) return null;

    return (
        <div className="bg-blue-900 border border-blue-600 text-blue-300 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent"></div>
                <span>
                    {progress.status === 'queued' && 'En attente dans la file...'}
                    {progress.status === 'executing' && `Génération en cours${progress.node ? ` (${progress.node})` : ''}...`}
                    {progress.status === 'completed' && 'Génération terminée !'}
                    {progress.status === 'error' && 'Erreur lors de la génération'}
                    {progress.progress && ` - ${Math.round(progress.progress)}%`}
                </span>
            </div>
            {progress.progress && (
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                    ></div>
                </div>
            )}
            {progress.error && (
                <div className="mt-2 text-red-300 text-sm">
                    Erreur: {progress.error}
                </div>
            )}
        </div>
    );
};