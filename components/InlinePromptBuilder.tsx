'use client';

import { useCallback, useState } from 'react';
import { PromptSentenceBuilder } from './PromptSentenceBuilder';
import { WorkflowSelectorModal } from './WorkflowSelectorModal';
import { usePromptEnhancement } from '../hooks/usePromptEnhancement';
import { useWebSocket } from '../hooks/useWebSocket';
import { WorkflowMetadata } from '../types';

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
    onGenerate: () => void;
    availableWorkflows?: WorkflowMetadata[];
    selectedWorkflow?: string | null;
    onWorkflowChange?: (workflowId: string) => void;
    error?: string | null;
    uploadedImage?: { file: File; previewUrl: string } | null;
    onImageUpload?: (file: File, previewUrl: string) => void;
    onImageRemove?: () => void;
}

const inlineFields = [
    {
        name: 'sujet',
        label: 'sujet',
        placeholder: 'un pot de miel',
        example: 'un pot de miel, une montagne enneigée, un chat noir',
        color: 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-blue-400/60 text-blue-200',
    },
    {
        name: 'contexte',
        label: 'contexte',
        placeholder: 'dans une cuisine',
        example:
            'dans une cuisine rustique, au coucher du soleil, sous la pluie',
        color: 'bg-gradient-to-r from-emerald-500/25 to-green-600/25 border-emerald-400/60 text-emerald-200',
    },
    {
        name: 'decor',
        label: 'décor',
        placeholder: 'fleurs sauvages',
        example: 'fleurs sauvages, arbres anciens, lampes vintage',
        color: 'bg-gradient-to-r from-pink-500/25 to-rose-600/25 border-pink-400/60 text-pink-200',
    },
    {
        name: 'composition',
        label: 'composition',
        placeholder: 'plan rapproché',
        example: 'plan rapproché, vue panoramique, angle faible',
        color: 'bg-gradient-to-r from-purple-500/25 to-violet-600/25 border-purple-400/60 text-purple-200',
    },
    {
        name: 'technique',
        label: 'technique',
        placeholder: 'aquarelle',
        example: 'aquarelle, photographie macro, rendu 3D',
        color: 'bg-gradient-to-r from-orange-500/25 to-amber-600/25 border-orange-400/60 text-orange-200',
    },
    {
        name: 'ambiance',
        label: 'ambiance',
        placeholder: 'lumière douce',
        example: 'atmosphère chaleureuse, lumière douce, ambiance mystérieuse',
        color: 'bg-gradient-to-r from-yellow-500/25 to-amber-500/25 border-yellow-400/60 text-yellow-200',
    },
    {
        name: 'details',
        label: 'détails',
        placeholder: 'haute qualité',
        example: 'haute qualité, ultra détaillé, 8k',
        color: 'bg-gradient-to-r from-cyan-500/25 to-teal-600/25 border-cyan-400/60 text-cyan-200',
    },
    {
        name: 'parametres',
        label: 'paramètres',
        placeholder: 'masterpiece',
        example: 'masterpiece, best quality, professional',
        color: 'bg-gradient-to-r from-indigo-500/25 to-blue-600/25 border-indigo-400/60 text-indigo-200',
    },
];

export const InlinePromptBuilder: React.FC<InlinePromptBuilderProps> = ({
    fields,
    technicalFields,
    onFieldChange,
    isGenerating,
    onGenerate,
    availableWorkflows = [],
    selectedWorkflow = null,
    onWorkflowChange,
    error: formError,
    uploadedImage,
    onImageUpload,
    onImageRemove,
}) => {
    const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
    const { connectionStatus, generatedImages, lastEvent, error: wsError } = useWebSocket();

    const hasContent = Object.values(fields).some(v => v.trim() !== '');
    const {
        enhancePrompt,
        isEnhancing,
        getSuggestionsForField,
        hasSuggestions,
        clearSuggestions,
        error: enhancementError,
    } = usePromptEnhancement();

    // Get WebSocket status styling
    const getWebSocketStyling = () => {
        switch (connectionStatus) {
            case 'connected':
                return {
                    borderClass: 'border-green-400/60 shadow-green-400/20',
                    pulseClass: 'animate-pulse',
                    statusDot: '🟢',
                    statusText: 'Connecté',
                    statusColor: 'text-green-400'
                };
            case 'connecting':
                return {
                    borderClass: 'border-yellow-400/60 shadow-yellow-400/20',
                    pulseClass: 'animate-pulse',
                    statusDot: '🟡',
                    statusText: 'Connexion...',
                    statusColor: 'text-yellow-400'
                };
            case 'disconnected':
                return {
                    borderClass: 'border-gray-400/40 shadow-gray-400/10',
                    pulseClass: '',
                    statusDot: '🔴',
                    statusText: 'Déconnecté',
                    statusColor: 'text-gray-400'
                };
            case 'error':
                return {
                    borderClass: 'border-red-400/60 shadow-red-400/20',
                    pulseClass: 'animate-pulse',
                    statusDot: '⚠️',
                    statusText: 'Erreur',
                    statusColor: 'text-red-400'
                };
            default:
                return {
                    borderClass: 'border-gray-400/30 shadow-gray-400/10',
                    pulseClass: '',
                    statusDot: '⚫',
                    statusText: 'Inconnu',
                    statusColor: 'text-gray-400'
                };
        }
    };

    const wsStyle = getWebSocketStyling();

    const handleNavigate = useCallback(
        (currentIndex: number, direction: 'prev' | 'next') => {
            const nextIndex =
                direction === 'next'
                    ? Math.min(currentIndex + 1, inlineFields.length - 1)
                    : Math.max(currentIndex - 1, 0);

            // Find and focus the next/prev field button
            setTimeout(() => {
                const nextButton = document.querySelector(
                    `[data-field-index="${nextIndex}"]`
                ) as HTMLButtonElement;
                if (nextButton) {
                    nextButton.click();
                }
            }, 150);
        },
        []
    );

    const handleEnhancePrompt = async () => {
        await enhancePrompt(fields);
    };

    const handleClearAll = () => {
        inlineFields.forEach(field => onFieldChange(field.name, ''));
        clearSuggestions();
    };

    return (
        <div className="space-y-3">
            {/* Workflow Selection Modal */}
            {availableWorkflows.length > 0 && onWorkflowChange && (
                <WorkflowSelectorModal
                    isOpen={isWorkflowModalOpen}
                    onClose={() => setIsWorkflowModalOpen(false)}
                    workflows={availableWorkflows}
                    selectedWorkflow={selectedWorkflow}
                    onWorkflowChange={onWorkflowChange}
                />
            )}

            {/* WebSocket Status Indicator */}
            <div className={`  border-2 ${wsStyle.borderClass} ${wsStyle.pulseClass} rounded-3xl p-4 shadow-lg transition-all duration-300`}>
                {/* Status Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">{wsStyle.statusDot}</span>
                            <span className={`text-sm font-medium ${wsStyle.statusColor} tracking-tight`}>
                                {wsStyle.statusText}
                            </span>
                        </div>
                        {generatedImages.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                                <span className="text-xs text-white/80 font-medium">
                                    {generatedImages.length} image{generatedImages.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {lastEvent && (
                        <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-lg font-mono">
                            {lastEvent.type}
                        </div>
                    )}
                </div>

                {/* Prompt Sentence Builder */}
                <PromptSentenceBuilder
                    fields={fields}
                    technicalFields={technicalFields}
                    onFieldChange={onFieldChange}
                    isGenerating={isGenerating}
                    isEnhancing={isEnhancing}
                    inlineFields={inlineFields}
                    getSuggestionsForField={getSuggestionsForField}
                    hasSuggestions={hasSuggestions}
                    onNavigate={handleNavigate}
                    onGenerate={onGenerate}
                    onEnhancePrompt={handleEnhancePrompt}
                    onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
                    selectedWorkflow={selectedWorkflow}
                    availableWorkflows={availableWorkflows}
                    error={formError}
                    onClearAll={handleClearAll}
                    hasContent={hasContent}
                    uploadedImage={uploadedImage}
                    onImageUpload={onImageUpload}
                    onImageRemove={onImageRemove}
                />
            </div>

            {/* WebSocket Error Display */}
            {wsError && (
                <div className="p-3 glass border border-red-400/30 rounded-2xl">
                    <div className="text-red-300 text-xs flex items-center gap-2">
                        <span className="text-red-400">⚠️</span>
                        Erreur WebSocket: {wsError}
                    </div>
                </div>
            )}

            {/* Enhancement Status Messages */}
            {enhancementError ? (
                <div className="p-3 glass border border-red-400/30 rounded-2xl">
                    <div className="text-red-300 text-xs">
                        Erreur lors de l&apos;amélioration: {enhancementError}
                    </div>
                </div>
            ) : null}

            {hasSuggestions && (
                <div className="p-3 glass border border-blue-400/30 rounded-2xl">
                    <div className="text-blue-300 text-xs flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        Suggestions IA disponibles - cliquez sur les champs
                        colorés pour voir les propositions
                    </div>
                </div>
            )}
        </div>
    );
};
