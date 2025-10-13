'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceRecorder } from './VoiceRecorder';

interface InlineField {
    name: string;
    label: string;
    placeholder: string;
    example: string;
    color: string;
}

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

const inlineFields: InlineField[] = [
    { name: 'sujet', label: 'sujet', placeholder: 'un pot de miel', example: 'un pot de miel, une montagne enneigée, un chat noir', color: 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-blue-400/60 text-blue-200' },
    { name: 'contexte', label: 'contexte', placeholder: 'dans une cuisine', example: 'dans une cuisine rustique, au coucher du soleil, sous la pluie', color: 'bg-gradient-to-r from-emerald-500/25 to-green-600/25 border-emerald-400/60 text-emerald-200' },
    { name: 'decor', label: 'décor', placeholder: 'fleurs sauvages', example: 'fleurs sauvages, arbres anciens, lampes vintage', color: 'bg-gradient-to-r from-pink-500/25 to-rose-600/25 border-pink-400/60 text-pink-200' },
    { name: 'composition', label: 'composition', placeholder: 'plan rapproché', example: 'plan rapproché, vue panoramique, angle faible', color: 'bg-gradient-to-r from-purple-500/25 to-violet-600/25 border-purple-400/60 text-purple-200' },
    { name: 'technique', label: 'technique', placeholder: 'aquarelle', example: 'aquarelle, photographie macro, rendu 3D', color: 'bg-gradient-to-r from-orange-500/25 to-amber-600/25 border-orange-400/60 text-orange-200' },
    { name: 'ambiance', label: 'ambiance', placeholder: 'lumière douce', example: 'atmosphère chaleureuse, lumière douce, ambiance mystérieuse', color: 'bg-gradient-to-r from-yellow-500/25 to-amber-500/25 border-yellow-400/60 text-yellow-200' },
    { name: 'details', label: 'détails', placeholder: 'haute qualité', example: 'haute qualité, ultra détaillé, 8k', color: 'bg-gradient-to-r from-cyan-500/25 to-teal-600/25 border-cyan-400/60 text-cyan-200' },
    { name: 'parametres', label: 'paramètres', placeholder: 'masterpiece', example: 'masterpiece, best quality, professional', color: 'bg-gradient-to-r from-indigo-500/25 to-blue-600/25 border-indigo-400/60 text-indigo-200' },
];

const InlineToken: React.FC<{
    field: InlineField;
    value: string;
    onChange: (value: string) => void;
    isGenerating: boolean;
    fieldIndex: number;
    onNavigate: (direction: 'prev' | 'next') => void;
}> = ({ field, value, onChange, isGenerating, fieldIndex, onNavigate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = () => {
        if (!isGenerating) {
            setIsEditing(true);
            setShowTooltip(false);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsEditing(false);
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            setIsEditing(false);
            if (!e.shiftKey) {
                onNavigate('next');
            } else {
                onNavigate('prev');
            }
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            buttonRef.current?.focus();
        } else if (e.key === 'ArrowRight' && inputRef.current) {
            const input = inputRef.current;
            if (input.selectionStart === input.value.length) {
                e.preventDefault();
                setIsEditing(false);
                onNavigate('next');
            }
        } else if (e.key === 'ArrowLeft' && inputRef.current) {
            const input = inputRef.current;
            if (input.selectionStart === 0) {
                e.preventDefault();
                setIsEditing(false);
                onNavigate('prev');
            }
        }
    };

    const displayValue = value || field.placeholder;
    const isEmpty = !value;

    if (isEditing) {
        return (
            <span className="inline-flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={field.placeholder}
                    disabled={isGenerating}
                    className={`
                        inline-block px-3 py-1.5 rounded-lg border-2
                        ${field.color}
                        bg-gray-800/90 text-white placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-400/50
                        min-w-[120px] max-w-[400px] transition-all
                    `}
                    style={{ width: `${Math.max(120, (value || field.placeholder).length * 8 + 24)}px` }}
                />
            </span>
        );
    }

    return (
        <div className="inline-block relative group">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={isGenerating}
                data-field-index={fieldIndex}
                className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all duration-200
                    ${field.color}
                    ${isEmpty ? 'border-dashed opacity-75' : 'border-solid'}
                    hover:scale-[1.02] hover:shadow-md hover:brightness-110
                    cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                `}
            >
                <span className={`font-medium text-sm ${isEmpty ? 'italic opacity-70' : ''}`}>
                    {displayValue}
                </span>
                {!isEmpty && (
                    <svg className="w-3 h-3 opacity-50 group-hover:opacity-70 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                )}
            </button>

            {/* Simple Tooltip */}
            {showTooltip && !isEditing && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200">
                    <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700/50 min-w-[320px] max-w-md">
                        <div className="text-xs font-medium text-gray-300 mb-1.5">
                            Exemple:
                        </div>
                        <div className="text-sm italic text-gray-100 leading-relaxed">
                            &quot;{field.example}&quot;
                        </div>
                        {/* Arrow */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                            <div className="border-4 border-transparent border-b-gray-900/95"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const InlinePromptBuilder: React.FC<InlinePromptBuilderProps> = ({
    fields,
    onFieldChange,
    isGenerating
}) => {
    const hasContent = Object.values(fields).some(v => v.trim() !== '');
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNavigate = useCallback((currentIndex: number, direction: 'prev' | 'next') => {
        const nextIndex = direction === 'next'
            ? Math.min(currentIndex + 1, inlineFields.length - 1)
            : Math.max(currentIndex - 1, 0);

        // Find and focus the next/prev field button
        setTimeout(() => {
            const nextButton = containerRef.current?.querySelector(`[data-field-index="${nextIndex}"]`) as HTMLButtonElement;
            if (nextButton) {
                nextButton.click();
            }
        }, 150);
    }, []);

    const handleTranscriptionComplete = (text: string) => {
        // Simple implementation - you can enhance this with more sophisticated NLP
        const lowerText = text.toLowerCase();

        // Try to extract subject (first few words typically describe the main subject)
        if (!fields.sujet) {
            const words = text.split(' ');
            const subjectWords = words.slice(0, 3).join(' ');
            onFieldChange('sujet', subjectWords);
        }

        // Look for context indicators
        if (lowerText.includes('dans') || lowerText.includes('sur') || lowerText.includes('sous')) {
            const contextMatch = text.match(/(dans|sur|sous)\s+([^,\.]+)/i);
            if (contextMatch && !fields.contexte) {
                onFieldChange('contexte', contextMatch[0]);
            }
        }

        // Look for style/technique indicators
        if (lowerText.includes('style') || lowerText.includes('peinture') || lowerText.includes('photo')) {
            const styleMatch = text.match(/(style|peinture|photo)\s+([^,\.]+)/i);
            if (styleMatch && !fields.technique) {
                onFieldChange('technique', styleMatch[0]);
            }
        }

        // If no specific fields are filled, put everything in subject
        if (!fields.sujet && !fields.contexte && !fields.technique) {
            onFieldChange('sujet', text);
        }
    }; return (
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-lg">✨</span>
                    </div>
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Créer une Image
                    </span>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Cliquez sur les champs colorés pour les personnaliser • Utilisez <kbd className="px-1.5 py-0.5 text-xs bg-gray-700/80 rounded border border-gray-600">Tab</kbd> ou <kbd className="px-1.5 py-0.5 text-xs bg-gray-700/80 rounded border border-gray-600">↵</kbd> pour naviguer
                </p>
            </div>

            {/* Sentence Builder */}
            <div ref={containerRef} className="bg-gray-950/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                <div className="text-base leading-relaxed text-gray-100">
                    {/* All content in a flowing sentence */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
                        <span>Je veux créer une image de</span>
                        <InlineToken
                            field={inlineFields[0]}
                            value={fields.sujet}
                            onChange={(v) => onFieldChange('sujet', v)}
                            isGenerating={isGenerating}
                            fieldIndex={0}
                            onNavigate={(dir) => handleNavigate(0, dir)}
                        />
                        <span>, situé</span>
                        <InlineToken
                            field={inlineFields[1]}
                            value={fields.contexte}
                            onChange={(v) => onFieldChange('contexte', v)}
                            isGenerating={isGenerating}
                            fieldIndex={1}
                            onNavigate={(dir) => handleNavigate(1, dir)}
                        />
                        <span>, avec comme décor</span>
                        <InlineToken
                            field={inlineFields[2]}
                            value={fields.decor}
                            onChange={(v) => onFieldChange('decor', v)}
                            isGenerating={isGenerating}
                            fieldIndex={2}
                            onNavigate={(dir) => handleNavigate(2, dir)}
                        />
                        <span>. La composition doit être</span>
                        <InlineToken
                            field={inlineFields[3]}
                            value={fields.composition}
                            onChange={(v) => onFieldChange('composition', v)}
                            isGenerating={isGenerating}
                            fieldIndex={3}
                            onNavigate={(dir) => handleNavigate(3, dir)}
                        />
                        <span>, dans le style</span>
                        <InlineToken
                            field={inlineFields[4]}
                            value={fields.technique}
                            onChange={(v) => onFieldChange('technique', v)}
                            isGenerating={isGenerating}
                            fieldIndex={4}
                            onNavigate={(dir) => handleNavigate(4, dir)}
                        />
                        <span>, avec une ambiance</span>
                        <InlineToken
                            field={inlineFields[5]}
                            value={fields.ambiance}
                            onChange={(v) => onFieldChange('ambiance', v)}
                            isGenerating={isGenerating}
                            fieldIndex={5}
                            onNavigate={(dir) => handleNavigate(5, dir)}
                        />
                        <span>. Les détails importants:</span>
                        <InlineToken
                            field={inlineFields[6]}
                            value={fields.details}
                            onChange={(v) => onFieldChange('details', v)}
                            isGenerating={isGenerating}
                            fieldIndex={6}
                            onNavigate={(dir) => handleNavigate(6, dir)}
                        />
                        <span>. Paramètres techniques:</span>
                        <InlineToken
                            field={inlineFields[7]}
                            value={fields.parametres}
                            onChange={(v) => onFieldChange('parametres', v)}
                            isGenerating={isGenerating}
                            fieldIndex={7}
                            onNavigate={(dir) => handleNavigate(7, dir)}
                        />
                        <span>.</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                        <span>Survolez les champs pour voir des exemples</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Voice Recording Component */}
                    <VoiceRecorder
                        onTranscriptionComplete={handleTranscriptionComplete}
                        isGenerating={isGenerating}
                    />                    {hasContent && (
                        <button
                            type="button"
                            onClick={() => {
                                inlineFields.forEach(field => onFieldChange(field.name, ''));
                            }}
                            disabled={isGenerating}
                            className="group flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-500/20"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Tout effacer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
