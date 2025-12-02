'use client';

import { useRef, useState, useEffect } from 'react';
import { InlineToken } from './InlineToken';
import { TechnicalParameters } from './TechnicalParameters';
import { ImageDropzone } from './ImageDropzone';
import { WorkflowMetadata } from '../types';

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
    technicalFields: {
        steps: number;
        guidance: number;
        aspectRatio: string;
        loraName: string;
        loraStrength: number;
        negatifs: string;
    };
    onFieldChange: (field: string, value: string | number) => void;
    isGenerating: boolean;
    isEnhancing: boolean;
    inlineFields: InlineField[];
    getSuggestionsForField: (field: string) => string[];
    hasSuggestions: boolean;
    onNavigate: (currentIndex: number, direction: 'prev' | 'next') => void;
    // Action buttons props
    onGenerate: () => void;
    onEnhancePrompt: () => void;
    onOpenWorkflowModal: () => void;
    selectedWorkflow?: string | null;
    availableWorkflows?: WorkflowMetadata[];
    error?: string | null;
    // Clear functionality
    onClearAll: () => void;
    hasContent: boolean;
    // Image upload props
    uploadedImage?: { file: File; previewUrl: string } | null;
    onImageUpload?: (file: File, previewUrl: string) => void;
    onImageRemove?: () => void;
}

export const PromptSentenceBuilder: React.FC<PromptSentenceBuilderProps> = ({
    fields,
    technicalFields,
    onFieldChange,
    isGenerating,
    isEnhancing,
    inlineFields,
    getSuggestionsForField,
    hasSuggestions,
    onNavigate,
    onGenerate,
    onEnhancePrompt,
    onOpenWorkflowModal,
    selectedWorkflow,
    availableWorkflows = [],
    error,
    onClearAll,
    hasContent,
    uploadedImage,
    onImageUpload,
    onImageRemove,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showParameters, setShowParameters] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const lastScrollYRef = useRef(0);

    // Auto-fold when generation starts
    useEffect(() => {
        if (isGenerating) {
            setIsExpanded(false);
        }
    }, [isGenerating]);

    // Handle scroll-based expand/collapse based on scroll direction
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // deltaY > 0 means scrolling down, < 0 means scrolling up
            if (e.deltaY > 0) {
                // Scrolling down - expand
                setIsExpanded(true);
            } else if (e.deltaY < 0) {
                // Scrolling up - collapse
                setIsExpanded(false);
            }
        };

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDiff = currentScrollY - lastScrollYRef.current;

            if (scrollDiff > 5) {
                setIsExpanded(true);
            } else if (scrollDiff < -5) {
                setIsExpanded(false);
            }

            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`glass rounded-2xl border transition-all duration-500 overflow-hidden ${
                isEnhancing
                    ? 'border-blue-400/40 shadow-lg shadow-blue-400/20 animate-pulse'
                    : 'border-white/10'
            } ${isExpanded ? 'p-5' : 'p-3'}`}
        >
            {isEnhancing && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse pointer-events-none"></div>
            )}

            {/* Action Bar */}
            <div className="flex gap-2 items-center relative z-10">
                {/* Collapse/Expand Button */}
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    disabled={isGenerating}
                    title={isExpanded ? 'Réduire le panel' : 'Étendre le panel'}
                    className="flex-shrink-0 p-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-400/30 hover:border-gray-400/50 text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 active:scale-95"
                >
                    <svg
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* Workflow Button */}
                <button
                    type="button"
                    onClick={onOpenWorkflowModal}
                    disabled={isGenerating}
                    title="Select workflow"
                    className={`
                        flex-shrink-0 p-2.5 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border active:scale-95
                        ${
                            selectedWorkflow
                              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-400/30 hover:border-blue-400/50'
                              : 'bg-orange-500/20 hover:bg-orange-500/30 text-white border-orange-400/30 hover:border-orange-400/50 animate-pulse'
                        }
                    `}
                >
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                </button>

                {/* Error/Warning Messages - Only show when expanded or if critical */}
                <div className="flex-1">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 backdrop-blur-sm">
                            <svg
                                className="w-3 h-3 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {isExpanded && (
                                <span className="font-medium">{error}</span>
                            )}
                        </div>
                    )}
                    {!selectedWorkflow &&
                        availableWorkflows.length > 0 &&
                        !error &&
                        isExpanded && (
                            <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 backdrop-blur-sm">
                                <svg
                                    className="w-3 h-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Sélectionnez un workflow</span>
                            </div>
                        )}
                </div>

                {/* Enhance Button */}
                <button
                    type="button"
                    onClick={onEnhancePrompt}
                    disabled={isGenerating || isEnhancing}
                    title="Améliorer le prompt avec l'IA"
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    {isEnhancing ? (
                        <>
                            <svg
                                className="w-3.5 h-3.5 animate-spin"
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
                            {isExpanded && <span>...</span>}
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                            {isExpanded && <span>Améliorer</span>}
                        </>
                    )}
                </button>

                {/* Generate Button */}
                <button
                    type="button"
                    onClick={onGenerate}
                    disabled={
                        isGenerating ||
                        fields.sujet.trim() === '' ||
                        !selectedWorkflow
                    }
                    className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium px-6 py-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 text-sm"
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white"></div>
                            {isExpanded && <span>Génération...</span>}
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {isExpanded && (
                                <span>Générer</span>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* Expandable Content */}
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded
                        ? 'max-h-[1000px] opacity-100 mt-4'
                        : 'max-h-0 opacity-0 mt-0'
                }`}
            >
                {/* Sentence Builder */}
                <div className="text-base leading-relaxed text-gray-100 relative z-10 font-light">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
                        <span>Je veux créer une image de</span>
                        <InlineToken
                            field={inlineFields[0]}
                            value={fields.sujet}
                            onChange={v => onFieldChange('sujet', v)}
                            isGenerating={isGenerating}
                            fieldIndex={0}
                            onNavigate={dir => onNavigate(0, dir)}
                            suggestions={getSuggestionsForField('sujet')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>, situé</span>
                        <InlineToken
                            field={inlineFields[1]}
                            value={fields.contexte}
                            onChange={v => onFieldChange('contexte', v)}
                            isGenerating={isGenerating}
                            fieldIndex={1}
                            onNavigate={dir => onNavigate(1, dir)}
                            suggestions={getSuggestionsForField('contexte')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>, avec comme décor</span>
                        <InlineToken
                            field={inlineFields[2]}
                            value={fields.decor}
                            onChange={v => onFieldChange('decor', v)}
                            isGenerating={isGenerating}
                            fieldIndex={2}
                            onNavigate={dir => onNavigate(2, dir)}
                            suggestions={getSuggestionsForField('decor')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>. La composition doit être</span>
                        <InlineToken
                            field={inlineFields[3]}
                            value={fields.composition}
                            onChange={v => onFieldChange('composition', v)}
                            isGenerating={isGenerating}
                            fieldIndex={3}
                            onNavigate={dir => onNavigate(3, dir)}
                            suggestions={getSuggestionsForField('composition')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>, dans le style</span>
                        <InlineToken
                            field={inlineFields[4]}
                            value={fields.technique}
                            onChange={v => onFieldChange('technique', v)}
                            isGenerating={isGenerating}
                            fieldIndex={4}
                            onNavigate={dir => onNavigate(4, dir)}
                            suggestions={getSuggestionsForField('technique')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>, avec une ambiance</span>
                        <InlineToken
                            field={inlineFields[5]}
                            value={fields.ambiance}
                            onChange={v => onFieldChange('ambiance', v)}
                            isGenerating={isGenerating}
                            fieldIndex={5}
                            onNavigate={dir => onNavigate(5, dir)}
                            suggestions={getSuggestionsForField('ambiance')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>. Les détails importants:</span>
                        <InlineToken
                            field={inlineFields[6]}
                            value={fields.details}
                            onChange={v => onFieldChange('details', v)}
                            isGenerating={isGenerating}
                            fieldIndex={6}
                            onNavigate={dir => onNavigate(6, dir)}
                            suggestions={getSuggestionsForField('details')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>. Paramètres techniques:</span>
                        <InlineToken
                            field={inlineFields[7]}
                            value={fields.parametres}
                            onChange={v => onFieldChange('parametres', v)}
                            isGenerating={isGenerating}
                            fieldIndex={7}
                            onNavigate={dir => onNavigate(7, dir)}
                            suggestions={getSuggestionsForField('parametres')}
                            hasSuggestions={hasSuggestions}
                        />
                        <span>.</span>
                    </div>
                </div>

                {/* Image Upload Dropzone */}
                {onImageUpload && onImageRemove && (
                    <div className="mt-4 relative z-10">
                        <ImageDropzone
                            uploadedImage={uploadedImage}
                            onImageUpload={onImageUpload}
                            onImageRemove={onImageRemove}
                        />
                    </div>
                )}

                {/* Technical Parameters - Collapsible */}
                <div className="space-y-2 relative z-10 mt-4">
                    <button
                        type="button"
                        onClick={() => setShowParameters(!showParameters)}
                        className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-blue-300 transition-colors"
                    >
                        <svg
                            className={`w-3 h-3 transition-transform duration-300 ${showParameters ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        <span>⚙️ Paramètres techniques</span>
                    </button>

                    {showParameters && (
                        <TechnicalParameters
                            parametres={fields.parametres}
                            steps={technicalFields.steps}
                            guidance={technicalFields.guidance}
                            aspectRatio={technicalFields.aspectRatio}
                            loraName={technicalFields.loraName}
                            loraStrength={technicalFields.loraStrength}
                            negatifs={technicalFields.negatifs}
                            onFieldChange={onFieldChange}
                            isGenerating={isGenerating}
                        />
                    )}
                </div>

                {/* Clear Button */}
                {hasContent && (
                    <div className="flex items-center justify-start mt-4 relative z-10">
                        <button
                            type="button"
                            onClick={onClearAll}
                            disabled={isGenerating}
                            title="Effacer tous les champs"
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-400/30 hover:border-red-400/50 active:scale-95"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Effacer tout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
