'use client';

import { useCallback } from 'react';
import { PromptBuilderHeader } from './PromptBuilderHeader';
import { PromptSentenceBuilder } from './PromptSentenceBuilder';
import { PromptBuilderActions } from './PromptBuilderActions';
import { usePromptEnhancement } from '../hooks/usePromptEnhancement';

interface InlinePromptBuilderProps {
    fields: {
        sujet: string;
        contexte: string;
        decor: string;
        composition: string;
        technique: string;
        ambiance: string;
        details: string;
        parametres: string;
    };
    onFieldChange: (field: string, value: string) => void;
    isGenerating: boolean;
}

const inlineFields = [
    { name: 'sujet', label: 'sujet', placeholder: 'un pot de miel', example: 'un pot de miel, une montagne enneigée, un chat noir', color: 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-blue-400/60 text-blue-200' },
    { name: 'contexte', label: 'contexte', placeholder: 'dans une cuisine', example: 'dans une cuisine rustique, au coucher du soleil, sous la pluie', color: 'bg-gradient-to-r from-emerald-500/25 to-green-600/25 border-emerald-400/60 text-emerald-200' },
    { name: 'decor', label: 'décor', placeholder: 'fleurs sauvages', example: 'fleurs sauvages, arbres anciens, lampes vintage', color: 'bg-gradient-to-r from-pink-500/25 to-rose-600/25 border-pink-400/60 text-pink-200' },
    { name: 'composition', label: 'composition', placeholder: 'plan rapproché', example: 'plan rapproché, vue panoramique, angle faible', color: 'bg-gradient-to-r from-purple-500/25 to-violet-600/25 border-purple-400/60 text-purple-200' },
    { name: 'technique', label: 'technique', placeholder: 'aquarelle', example: 'aquarelle, photographie macro, rendu 3D', color: 'bg-gradient-to-r from-orange-500/25 to-amber-600/25 border-orange-400/60 text-orange-200' },
    { name: 'ambiance', label: 'ambiance', placeholder: 'lumière douce', example: 'atmosphère chaleureuse, lumière douce, ambiance mystérieuse', color: 'bg-gradient-to-r from-yellow-500/25 to-amber-500/25 border-yellow-400/60 text-yellow-200' },
    { name: 'details', label: 'détails', placeholder: 'haute qualité', example: 'haute qualité, ultra détaillé, 8k', color: 'bg-gradient-to-r from-cyan-500/25 to-teal-600/25 border-cyan-400/60 text-cyan-200' },
    { name: 'parametres', label: 'paramètres', placeholder: 'masterpiece', example: 'masterpiece, best quality, professional', color: 'bg-gradient-to-r from-indigo-500/25 to-blue-600/25 border-indigo-400/60 text-indigo-200' },
];

export const InlinePromptBuilder: React.FC<InlinePromptBuilderProps> = ({
    fields,
    onFieldChange,
    isGenerating
}) => {
    const hasContent = Object.values(fields).some(v => v.trim() !== '');
    const {
        enhancePrompt,
        isEnhancing,
        getSuggestionsForField,
        hasSuggestions,
        clearSuggestions,
        error
    } = usePromptEnhancement();

    const handleNavigate = useCallback((currentIndex: number, direction: 'prev' | 'next') => {
        const nextIndex = direction === 'next'
            ? Math.min(currentIndex + 1, inlineFields.length - 1)
            : Math.max(currentIndex - 1, 0);

        // Find and focus the next/prev field button
        setTimeout(() => {
            const nextButton = document.querySelector(`[data-field-index="${nextIndex}"]`) as HTMLButtonElement;
            if (nextButton) {
                nextButton.click();
            }
        }, 150);
    }, []);

    const handleEnhancePrompt = async () => {
        await enhancePrompt(fields);
    };

    const handleClearAll = () => {
        inlineFields.forEach(field => onFieldChange(field.name, ''));
        clearSuggestions();
    };

    return (
        <div>
            <PromptSentenceBuilder
                fields={fields}
                onFieldChange={onFieldChange}
                isGenerating={isGenerating}
                isEnhancing={isEnhancing}
                inlineFields={inlineFields}
                getSuggestionsForField={getSuggestionsForField}
                hasSuggestions={hasSuggestions}
                onNavigate={handleNavigate}
            />

            <PromptBuilderActions
                isGenerating={isGenerating}
                isEnhancing={isEnhancing}
                hasContent={hasContent}
                hasSuggestions={hasSuggestions}
                error={error}
                onEnhancePrompt={handleEnhancePrompt}
                onClearAll={handleClearAll}
            />
        </div>
    );
};
