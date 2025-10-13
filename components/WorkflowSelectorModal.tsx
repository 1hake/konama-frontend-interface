'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { WorkflowMetadata } from '../types';

interface WorkflowSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    workflows: WorkflowMetadata[];
    selectedWorkflow: string | null;
    onWorkflowChange: (workflowId: string) => void;
}

export const WorkflowSelectorModal: React.FC<WorkflowSelectorModalProps> = ({
    isOpen,
    onClose,
    workflows,
    selectedWorkflow,
    onWorkflowChange,
}) => {
    const handleSelectWorkflow = (workflowId: string) => {
        onWorkflowChange(workflowId);
        onClose();
    };

    const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-2xl transition-all border-2 border-purple-500/30">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-2xl font-bold text-white flex items-center gap-2"
                                        >
                                            <span>🔧</span>
                                            <span>Sélectionner un Workflow ComfyUI</span>
                                        </Dialog.Title>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Choisissez le workflow d&apos;IA pour générer vos images
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                        onClick={onClose}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Current Selection */}
                                {selectedWorkflowData && (
                                    <div className="mb-6 p-4 bg-purple-900/30 border-2 border-purple-500/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-semibold">Workflow actuel</span>
                                        </div>
                                        <p className="text-white font-bold text-lg">{selectedWorkflowData.name}</p>
                                        <p className="text-gray-300 text-sm">{selectedWorkflowData.description}</p>
                                    </div>
                                )}

                                {/* Workflows Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {workflows.map((workflow) => (
                                        <button
                                            key={workflow.id}
                                            type="button"
                                            onClick={() => handleSelectWorkflow(workflow.id)}
                                            className={`
                                                group text-left p-5 rounded-xl border-2 transition-all duration-200
                                                ${selectedWorkflow === workflow.id
                                                    ? 'border-purple-500 bg-purple-900/40 shadow-lg shadow-purple-500/20'
                                                    : 'border-gray-600 bg-gray-700/30 hover:border-purple-400 hover:bg-gray-700/50 hover:shadow-lg'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                                                        {workflow.name}
                                                    </h4>
                                                    <p className="text-gray-400 text-sm leading-relaxed">
                                                        {workflow.description}
                                                    </p>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    {selectedWorkflow === workflow.id ? (
                                                        <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full border-2 border-gray-500 group-hover:border-purple-400 transition-colors"></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="px-2.5 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md font-medium">
                                                    {workflow.category}
                                                </span>
                                                {workflow.tags?.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-2.5 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-md">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Metadata */}
                                            <div className="space-y-1 text-xs text-gray-400">
                                                {workflow.author && (
                                                    <p className="flex items-center gap-1.5">
                                                        <span>👤</span>
                                                        <span>{workflow.author}</span>
                                                    </p>
                                                )}
                                                {workflow.version && (
                                                    <p className="flex items-center gap-1.5">
                                                        <span>📦</span>
                                                        <span>Version {workflow.version}</span>
                                                    </p>
                                                )}
                                                {workflow.supportsNegativePrompt && (
                                                    <p className="flex items-center gap-1.5 text-green-400">
                                                        <span>✅</span>
                                                        <span>Prompt négatif supporté</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Required Models */}
                                            {workflow.requiredModels && workflow.requiredModels.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-600">
                                                    <p className="text-xs font-semibold text-gray-300 mb-1.5">Modèles requis:</p>
                                                    <div className="space-y-1">
                                                        {workflow.requiredModels.slice(0, 2).map((model, idx) => (
                                                            <p key={idx} className="text-xs text-gray-400 font-mono truncate">
                                                                • {model}
                                                            </p>
                                                        ))}
                                                        {workflow.requiredModels.length > 2 && (
                                                            <p className="text-xs text-gray-500">
                                                                +{workflow.requiredModels.length - 2} autres...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                        onClick={onClose}
                                    >
                                        Fermer
                                    </button>
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
