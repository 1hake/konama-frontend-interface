import React, { useState, useEffect, useCallback } from 'react';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowSubmission } from '@/hooks/useWorkflowSubmission';
import { usePromptEnhancement } from '@/hooks/usePromptEnhancement';
import { UserPromptInput } from '@/types/workflow-api';
import { PromptSentenceBuilder } from './PromptSentenceBuilder';
import { WorkflowSelectorModal } from './WorkflowSelectorModal';

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

export function WorkflowPromptForm() {
  const { workflows, error: workflowError } = useWorkflows();
  const { submitWorkflow, isSubmitting, error: submissionError } = useWorkflowSubmission({
    onSuccess: (data) => {
      console.log('✅ Workflow submitted successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Submission failed:', error);
    },
  });
  
  const { 
    isEnhancing, 
    enhancePrompt, 
    getSuggestionsForField, 
    hasSuggestions 
  } = usePromptEnhancement();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  
  // Prompt fields state
  const [fields, setFields] = useState({
    sujet: '',
    contexte: '',
    decor: '',
    composition: '',
    technique: '',
    ambiance: '',
    details: '',
    parametres: '',
  });
  
  // Technical fields state
  const [technicalFields, setTechnicalFields] = useState({
    steps: 20,
    guidance: 7.5,
    aspectRatio: '1:1',
    loraName: '',
    loraStrength: 0.8,
    negatifs: '',
  });

  
  // Set default workflow when workflows load
  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(workflows[0].id);
    }
  }, [workflows, selectedWorkflowId]);
  
  // Handle field changes
  const handleFieldChange = useCallback((field: string, value: string | number) => {
    if (field === 'negatifs' || field === 'steps' || field === 'guidance' || field === 'aspectRatio' || field === 'loraName' || field === 'loraStrength') {
      setTechnicalFields(prev => ({ ...prev, [field]: value }));
    } else {
      setFields(prev => ({ ...prev, [field]: value }));
    }
  }, []);
  

  
  // Build the final prompt from fields
  const buildPrompt = useCallback(() => {
    const parts = [];
    if (fields.sujet) parts.push(fields.sujet);
    if (fields.contexte) parts.push(fields.contexte);
    if (fields.decor) parts.push(fields.decor);
    if (fields.composition) parts.push(fields.composition);
    if (fields.technique) parts.push(fields.technique);
    if (fields.ambiance) parts.push(fields.ambiance);
    if (fields.details) parts.push(fields.details);
    if (fields.parametres) parts.push(fields.parametres);
    return parts.filter(p => p.trim()).join(', ');
  }, [fields]);
  
  // Handle prompt enhancement
  const handleEnhancePrompt = useCallback(async () => {
    await enhancePrompt(fields);
  }, [fields, enhancePrompt]);
  
  // Clear all fields
  const handleClearAll = useCallback(() => {
    setFields({
      sujet: '',
      contexte: '',
      decor: '',
      composition: '',
      technique: '',
      ambiance: '',
      details: '',
      parametres: '',
    });
    setTechnicalFields({
      steps: 20,
      guidance: 7.5,
      aspectRatio: '1:1',
      loraName: '',
      loraStrength: 0.8,
      negatifs: '',
    });
  }, []);
  
  const hasContent = Object.values(fields).some(v => v.trim() !== '') || technicalFields.negatifs.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkflowId) {
      alert('Please select a workflow');
      return;
    }

    const positivePrompt = buildPrompt();
    if (!positivePrompt.trim()) {
      alert('Please enter at least one prompt field');
      return;
    }

    const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);
    if (!selectedWorkflow) {
      alert('Selected workflow not found');
      return;
    }

    if (!selectedWorkflow.details) {
      alert('Workflow details not loaded. Please try again.');
      return;
    }

    const userPrompt: UserPromptInput = {
      positive: positivePrompt,
      negative: technicalFields.negatifs || undefined,
    };

    await submitWorkflow({
      workflowId: selectedWorkflowId,
      workflowData: selectedWorkflow.details,
      userPrompt,
      mode: 'slow',
    });
  };
  
  const handleGenerate = () => {
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow Selector Modal */}
        <WorkflowSelectorModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          workflows={workflows}
          selectedWorkflow={selectedWorkflowId}
          onWorkflowChange={setSelectedWorkflowId}
        />

        {workflowError && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading workflows: {workflowError}
          </div>
        )}

        {submissionError && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Submission error: {submissionError.message}
          </div>
        )}

        <PromptSentenceBuilder
          fields={fields}
          technicalFields={technicalFields}
          onFieldChange={handleFieldChange}
          isGenerating={isSubmitting}
          isEnhancing={isEnhancing}
          inlineFields={inlineFields}
          getSuggestionsForField={getSuggestionsForField}
          hasSuggestions={hasSuggestions}
          onNavigate={() => {}}
          onGenerate={handleGenerate}
          onEnhancePrompt={handleEnhancePrompt}
          onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
          selectedWorkflow={selectedWorkflowId}
          availableWorkflows={workflows}
          error={workflowError || submissionError?.message || null}
          onClearAll={handleClearAll}
          hasContent={hasContent}
        />
      </form>
    </div>
  );
}
