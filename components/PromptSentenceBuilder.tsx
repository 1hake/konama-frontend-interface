'use client';

import { useRef } from 'react';
import { InlineToken } from './InlineToken';

interface InlineField {
    name: string;
    label: string;
    placeholder: string;
    example: string;
    color: string;
}

interface PromptSentenceBuilderProps {
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
    isEnhancing: boolean;
    inlineFields: InlineField[];
    getSuggestionsForField: (field: string) => string[];
    hasSuggestions: boolean;
    onNavigate: (currentIndex: number, direction: 'prev' | 'next') => void;
}

export const PromptSentenceBuilder: React.FC<PromptSentenceBuilderProps> = ({
    fields,
    onFieldChange,
    isGenerating,
    isEnhancing,
    inlineFields,
    getSuggestionsForField,
    hasSuggestions,
    onNavigate
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className={`bg-gray-700/50 rounded-lg p-3 border transition-all duration-500 ${isEnhancing
                ? 'border-purple-400/60 shadow-lg shadow-purple-400/20 animate-pulse'
                : 'border-gray-600/30'
                }`}
        >
            {isEnhancing && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none"></div>
            )}
            <div className="text-sm leading-relaxed text-gray-100 relative z-10">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
                    <span>Je veux créer une image de</span>
                    <InlineToken
                        field={inlineFields[0]}
                        value={fields.sujet}
                        onChange={(v) => onFieldChange('sujet', v)}
                        isGenerating={isGenerating}
                        fieldIndex={0}
                        onNavigate={(dir) => onNavigate(0, dir)}
                        suggestions={getSuggestionsForField('sujet')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>, situé</span>
                    <InlineToken
                        field={inlineFields[1]}
                        value={fields.contexte}
                        onChange={(v) => onFieldChange('contexte', v)}
                        isGenerating={isGenerating}
                        fieldIndex={1}
                        onNavigate={(dir) => onNavigate(1, dir)}
                        suggestions={getSuggestionsForField('contexte')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>, avec comme décor</span>
                    <InlineToken
                        field={inlineFields[2]}
                        value={fields.decor}
                        onChange={(v) => onFieldChange('decor', v)}
                        isGenerating={isGenerating}
                        fieldIndex={2}
                        onNavigate={(dir) => onNavigate(2, dir)}
                        suggestions={getSuggestionsForField('decor')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>. La composition doit être</span>
                    <InlineToken
                        field={inlineFields[3]}
                        value={fields.composition}
                        onChange={(v) => onFieldChange('composition', v)}
                        isGenerating={isGenerating}
                        fieldIndex={3}
                        onNavigate={(dir) => onNavigate(3, dir)}
                        suggestions={getSuggestionsForField('composition')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>, dans le style</span>
                    <InlineToken
                        field={inlineFields[4]}
                        value={fields.technique}
                        onChange={(v) => onFieldChange('technique', v)}
                        isGenerating={isGenerating}
                        fieldIndex={4}
                        onNavigate={(dir) => onNavigate(4, dir)}
                        suggestions={getSuggestionsForField('technique')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>, avec une ambiance</span>
                    <InlineToken
                        field={inlineFields[5]}
                        value={fields.ambiance}
                        onChange={(v) => onFieldChange('ambiance', v)}
                        isGenerating={isGenerating}
                        fieldIndex={5}
                        onNavigate={(dir) => onNavigate(5, dir)}
                        suggestions={getSuggestionsForField('ambiance')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>. Les détails importants:</span>
                    <InlineToken
                        field={inlineFields[6]}
                        value={fields.details}
                        onChange={(v) => onFieldChange('details', v)}
                        isGenerating={isGenerating}
                        fieldIndex={6}
                        onNavigate={(dir) => onNavigate(6, dir)}
                        suggestions={getSuggestionsForField('details')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>. Paramètres techniques:</span>
                    <InlineToken
                        field={inlineFields[7]}
                        value={fields.parametres}
                        onChange={(v) => onFieldChange('parametres', v)}
                        isGenerating={isGenerating}
                        fieldIndex={7}
                        onNavigate={(dir) => onNavigate(7, dir)}
                        suggestions={getSuggestionsForField('parametres')}
                        hasSuggestions={hasSuggestions}
                    />
                    <span>.</span>
                </div>
            </div>
        </div>
    );
};