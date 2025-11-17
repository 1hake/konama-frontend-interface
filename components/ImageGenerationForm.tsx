'use client';

import { useState } from 'react';
import { ImageGenerationFormProps } from '../types';
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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const constructedPrompt = constructPrompt();
        await onGenerate(constructedPrompt, fields.negatifs, {
            steps: fields.steps,
            aspectRatio: fields.aspectRatio,
            guidance: fields.guidance,
            loraName: fields.loraName,
            loraStrength: fields.loraStrength
        });
    };

    return (
        <div className="fixed bottom-6 left-6 right-6  rounded-3xl shadow-2xl z-50 transition-all duration-300">
            <div className="mx-auto px-8 py-6 max-w-6xl">
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
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
                        technicalFields={{
                            steps: fields.steps,
                            guidance: fields.guidance,
                            aspectRatio: fields.aspectRatio,
                            loraName: fields.loraName,
                            loraStrength: fields.loraStrength,
                            negatifs: fields.negatifs
                        }}
                        onFieldChange={handleFieldChange}
                        isGenerating={isGenerating}
                        onGenerate={handleSubmit}
                        availableWorkflows={availableWorkflows}
                        selectedWorkflow={selectedWorkflow}
                        onWorkflowChange={onWorkflowChange}
                        onRefreshWorkflows={onRefreshWorkflows}
                        error={error}
                    />
                </div>
            </div>

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