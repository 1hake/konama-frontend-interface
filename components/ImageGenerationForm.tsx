'use client';

import { useState } from 'react';
import { ImageGenerationFormProps } from '../types';
import { TechnicalParameters } from './TechnicalParameters';
import { PromptPreview } from './PromptPreview';
import { ActionButtons } from './ActionButtons';
import { WorkflowSelectorModal } from './WorkflowSelectorModal';
import { InlinePromptBuilder } from './InlinePromptBuilder';

interface PromptFields {
    sujet: string;
    contexte: string;
    decor: string;
    composition: string;
    technique: string;
    ambiance: string;
    details: string;
    parametres: string;
    negatifs: string;
    steps: number;
    aspectRatio: string;
    guidance: number;
    loraName: string;
    loraStrength: number;
}

export const ImageGenerationForm: React.FC<ImageGenerationFormProps> = ({
    onGenerate,
    isGenerating,
    error,
    availableWorkflows = [],
    selectedWorkflow = null,
    onWorkflowChange,
    onRefreshWorkflows
}) => {
    // Debug logging
    console.log('ImageGenerationForm rendered with:', {
        availableWorkflows: availableWorkflows.length,
        selectedWorkflow,
        workflows: availableWorkflows
    });

    const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
    const [fields, setFields] = useState<PromptFields>({
        sujet: '',
        contexte: '',
        decor: '',
        composition: '',
        technique: '',
        ambiance: '',
        details: '',
        parametres: '',
        negatifs: '',
        steps: 20,
        aspectRatio: '1:1 (Square)',
        guidance: 3.5,
        loraName: 'CynthiaArch.safetensors',
        loraStrength: 1.0
    });

    const updateField = (field: keyof PromptFields, value: string | number) => {
        setFields(prev => ({ ...prev, [field]: value as any }));
    };

    const handleFieldChange = (field: string, value: string | number) => {
        updateField(field as keyof PromptFields, value);
    };

    const constructPrompt = (): string => {
        const parts: string[] = [];

        if (fields.sujet) parts.push(fields.sujet);
        if (fields.contexte) parts.push(fields.contexte);
        if (fields.decor) parts.push(fields.decor);
        if (fields.composition) parts.push(fields.composition);
        if (fields.technique) parts.push(fields.technique);
        if (fields.ambiance) parts.push(fields.ambiance);
        if (fields.details) parts.push(fields.details);
        if (fields.parametres) parts.push(fields.parametres);

        return parts.join(', ');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const constructedPrompt = constructPrompt();
        await onGenerate(constructedPrompt, fields.negatifs, {
            steps: fields.steps,
            aspectRatio: fields.aspectRatio,
            guidance: fields.guidance,
            loraName: fields.loraName,
            loraStrength: fields.loraStrength
        });
    };

    const handleReset = () => {
        setFields({
            sujet: '',
            contexte: '',
            decor: '',
            composition: '',
            technique: '',
            ambiance: '',
            details: '',
            parametres: '',
            negatifs: '',
            steps: 20,
            aspectRatio: '1:1 (Square)',
            guidance: 3.5,
            loraName: 'CynthiaArch.safetensors',
            loraStrength: 1.0
        });
    };

    const hasAnyContent = Object.entries(fields).some(([key, value]) => {
        if (key === 'steps') {
            return value !== 20; // Check if steps is different from default
        }
        if (key === 'guidance') {
            return value !== 3.5; // Check if guidance is different from default
        }
        if (key === 'loraStrength') {
            return value !== 1.0; // Check if LoRA strength is different from default
        }
        if (key === 'aspectRatio') {
            return value !== '1:1 (Square)'; // Check if aspect ratio is different from default
        }
        if (key === 'loraName') {
            return value !== 'CynthiaArch.safetensors'; // Check if LoRA name is different from default
        }
        return typeof value === 'string' && value.trim() !== '';
    });

    return (
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 h-full">
            <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-4">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/50 border-2 border-red-500 text-red-200 px-4 py-3 rounded-xl shadow-lg animate-pulse">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Workflow Selection Warning */}
                {!selectedWorkflow && availableWorkflows.length > 0 && (
                    <div className="bg-orange-900/50 border-2 border-orange-500 text-orange-200 px-4 py-3 rounded-xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Veuillez sélectionner un workflow pour commencer</span>
                        </div>
                    </div>
                )}

                {/* Form Title with Workflow Button */}
                <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 rounded-xl p-4 border border-purple-500/30 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                <span>🎨</span>
                                <span>Générateur d&apos;Images IA</span>
                            </h2>
                            <p className="text-gray-300 text-xs md:text-sm">Interface professionnelle • Flux Krea Dev • LoRA</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsWorkflowModalOpen(true)}
                            disabled={isGenerating}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed
                                ${selectedWorkflow
                                    ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white'
                                    : 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white animate-pulse'
                                }
                            `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden sm:inline">
                                {selectedWorkflow ? `Workflow (${availableWorkflows.length})` : 'Sélectionner un workflow'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Workflow Selection Modal */}
                {availableWorkflows.length > 0 && onWorkflowChange && (
                    <WorkflowSelectorModal
                        isOpen={isWorkflowModalOpen}
                        onClose={() => setIsWorkflowModalOpen(false)}
                        workflows={availableWorkflows}
                        selectedWorkflow={selectedWorkflow}
                        onWorkflowChange={onWorkflowChange}
                        onRefresh={onRefreshWorkflows}
                    />
                )}

                {/* Main Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {/* Inline Prompt Builder */}
                    <InlinePromptBuilder
                        fields={{
                            sujet: fields.sujet,
                            contexte: fields.contexte,
                            decor: fields.decor,
                            composition: fields.composition,
                            technique: fields.technique,
                            ambiance: fields.ambiance,
                            details: fields.details,
                            parametres: fields.parametres
                        }}
                        onFieldChange={handleFieldChange}
                        isGenerating={isGenerating}
                    />

                    {/* Technical Parameters */}
                    <TechnicalParameters
                        parametres={fields.parametres}
                        steps={fields.steps}
                        guidance={fields.guidance}
                        aspectRatio={fields.aspectRatio}
                        loraName={fields.loraName}
                        loraStrength={fields.loraStrength}
                        negatifs={fields.negatifs}
                        onFieldChange={handleFieldChange}
                        isGenerating={isGenerating}
                    />

                    {/* Preview du prompt */}
                    <PromptPreview
                        constructedPrompt={constructPrompt()}
                        negatifs={fields.negatifs}
                        hasContent={hasAnyContent}
                    />
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="pt-2 border-t border-gray-700">
                    <ActionButtons
                        isGenerating={isGenerating}
                        canGenerate={fields.sujet.trim() !== '' && selectedWorkflow !== null}
                        hasContent={hasAnyContent}
                        onGenerate={() => { }} // This will be handled by form submission
                        onReset={handleReset}
                    />
                </div>
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.7);
                }
            `}</style>
        </div>
    );
};