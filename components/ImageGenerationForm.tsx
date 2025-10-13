'use client';

import { useState } from 'react';
import { ImageGenerationFormProps } from '../types';
import { CoreElements } from './CoreElements';
import { CompositionTechnique } from './CompositionTechnique';
import { AmbianceDetails } from './AmbianceDetails';
import { TechnicalParameters } from './TechnicalParameters';
import { PromptPreview } from './PromptPreview';
import { ActionButtons } from './ActionButtons';
import { WorkflowSelector } from './WorkflowSelector';

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
    onWorkflowChange
}) => {
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

                {/* Form Title */}
                <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 rounded-xl p-4 border border-purple-500/30 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                <span>🎨</span>
                                <span>Générateur d&apos;Images IA</span>
                            </h2>
                            <p className="text-gray-300 text-xs md:text-sm">Interface professionnelle • Flux Krea Dev • LoRA</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="inline-block px-3 py-1 bg-purple-600/50 rounded-lg text-xs text-purple-200 font-medium">
                                Résolution dynamique
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {/* Workflow Selector */}
                    {availableWorkflows.length > 0 && onWorkflowChange && (
                        <WorkflowSelector
                            workflows={availableWorkflows}
                            selectedWorkflow={selectedWorkflow}
                            onWorkflowChange={onWorkflowChange}
                            isGenerating={isGenerating}
                        />
                    )}

                    {/* Core Elements */}
                    <CoreElements
                        sujet={fields.sujet}
                        contexte={fields.contexte}
                        decor={fields.decor}
                        onFieldChange={handleFieldChange}
                        isGenerating={isGenerating}
                    />

                    {/* Composition & Technique */}
                    <CompositionTechnique
                        composition={fields.composition}
                        technique={fields.technique}
                        onFieldChange={handleFieldChange}
                        isGenerating={isGenerating}
                    />

                    {/* Ambiance & Details */}
                    <AmbianceDetails
                        ambiance={fields.ambiance}
                        details={fields.details}
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
                        canGenerate={fields.sujet.trim() !== ''}
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