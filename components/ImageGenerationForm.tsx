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
    onRefreshWorkflows,
    isFunnelMode = false,
    selectedWorkflows = [],
    onSelectedWorkflowsChange,
    viewStepIndex,
    currentStepIndex,
    editingPromptFields,
    editingTechnicalFields,
    onEditingFieldsChange
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

    const [uploadedImage, setUploadedImage] = useState<{ file: File; previewUrl: string } | null>(null);

    // In funnel mode, show editing fields when viewing a past step
    const isViewingPastStep = isFunnelMode && viewStepIndex !== undefined && currentStepIndex !== undefined && viewStepIndex !== currentStepIndex;
    const displayFields = isViewingPastStep && editingPromptFields ? editingPromptFields : {
        sujet: fields.sujet,
        contexte: fields.contexte,
        decor: fields.decor,
        composition: fields.composition,
        technique: fields.technique,
        ambiance: fields.ambiance,
        details: fields.details,
        parametres: fields.parametres
    };
    const displayTechnicalFields = isViewingPastStep && editingTechnicalFields ? editingTechnicalFields : {
        steps: fields.steps,
        aspectRatio: fields.aspectRatio,
        guidance: fields.guidance,
        loraName: fields.loraName,
        loraStrength: fields.loraStrength,
        negatifs: fields.negatifs
    };

    const updateField = (field: keyof PromptFields, value: string | number) => {
        setFields(prev => ({ ...prev, [field]: value }));
    };

    const handleFieldChange = (field: string, value: string | number) => {
        updateField(field as keyof PromptFields, value);

        // If editing in funnel mode, update the editing fields
        if (isViewingPastStep && onEditingFieldsChange) {
            const promptFieldNames = ['sujet', 'contexte', 'decor', 'composition', 'technique', 'ambiance', 'details', 'parametres'];
            const technicalFieldNames = ['steps', 'guidance', 'aspectRatio', 'loraName', 'loraStrength', 'negatifs'];

            if (promptFieldNames.includes(field)) {
                const updatedPromptFields = { ...editingPromptFields, [field]: value };
                onEditingFieldsChange(updatedPromptFields, editingTechnicalFields);
            } else if (technicalFieldNames.includes(field)) {
                const updatedTechnicalFields = { ...editingTechnicalFields, [field]: value };
                onEditingFieldsChange(editingPromptFields, updatedTechnicalFields);
            }
        }
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

        // In funnel mode, include the prompt and technical fields for storage
        const extendedOptions = isFunnelMode ? {
            steps: fields.steps,
            aspectRatio: fields.aspectRatio,
            guidance: fields.guidance,
            loraName: fields.loraName,
            loraStrength: fields.loraStrength,
            uploadedImage: uploadedImage,
            // Include the prompt fields for storage in funnel step
            promptFields: {
                sujet: fields.sujet,
                contexte: fields.contexte,
                decor: fields.decor,
                composition: fields.composition,
                technique: fields.technique,
                ambiance: fields.ambiance,
                details: fields.details,
                parametres: fields.parametres,
            },
            technicalParameters: {
                steps: fields.steps,
                aspectRatio: fields.aspectRatio,
                guidance: fields.guidance,
                loraName: fields.loraName,
                loraStrength: fields.loraStrength,
                negatifs: fields.negatifs,
            }
        } : {
            steps: fields.steps,
            aspectRatio: fields.aspectRatio,
            guidance: fields.guidance,
            loraName: fields.loraName,
            loraStrength: fields.loraStrength,
            uploadedImage: uploadedImage
        };

        await onGenerate(constructedPrompt, fields.negatifs, extendedOptions);
    };

    const handleImageUpload = (file: File, previewUrl: string) => {
        setUploadedImage({ file, previewUrl });
    };

    const handleImageRemove = () => {
        if (uploadedImage) {
            URL.revokeObjectURL(uploadedImage.previewUrl);
        }
        setUploadedImage(null);
    };

    return (
        <div className="fixed bottom-6 left-6 right-6  rounded-3xl  z-50 transition-all duration-300">
            <div className="mx-auto px-8 py-6 max-w-6xl">
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                    <InlinePromptBuilder
                        fields={displayFields}
                        technicalFields={displayTechnicalFields}
                        onFieldChange={handleFieldChange}
                        isGenerating={isGenerating}
                        onGenerate={handleSubmit}
                        availableWorkflows={availableWorkflows}
                        selectedWorkflow={selectedWorkflow}
                        onWorkflowChange={onWorkflowChange}
                        onRefreshWorkflows={onRefreshWorkflows}
                        error={error}
                        isFunnelMode={isFunnelMode}
                        selectedWorkflows={selectedWorkflows}
                        onSelectedWorkflowsChange={onSelectedWorkflowsChange}
                        isViewingPastStep={isViewingPastStep}
                        uploadedImage={uploadedImage}
                        onImageUpload={handleImageUpload}
                        onImageRemove={handleImageRemove}
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