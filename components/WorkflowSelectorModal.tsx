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

    const getSourceBadge = (source?: string) => {
        switch (source) {
            case 'api':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 text-green-300 text-xs rounded border border-green-500/30">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        API
                    </span>
                );
            case 'local':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-500/30">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        Local
                    </span>
                );
            case 'auto-detected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-900/30 text-yellow-300 text-xs rounded border border-yellow-500/30">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                        Auto
                    </span>
                );
            case 'fallback':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-900/30 text-red-300 text-xs rounded border border-red-500/30">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        Fallback
                    </span>
                );
            default:
                return null;
        };
    };

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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800/95 backdrop-blur-sm p-6 text-left align-middle shadow-2xl transition-all border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-2xl font-bold text-white">
                                        Select Workflow
                                    </Dialog.Title>
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

                                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {workflows.map(workflow => {
                                        const isSelected = selectedWorkflow === workflow.id;
                                        return (
                                            <button
                                                key={workflow.id}
                                                type="button"
                                                onClick={() => handleSelectWorkflow(workflow.id)}
                                                className={`
                                                    w-full text-left p-4 rounded-lg border-2 transition-all
                                                    ${
                                                        isSelected
                                                            ? 'border-purple-500 bg-purple-500/10'
                                                            : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-700/50'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-white">
                                                                {workflow.name}
                                                            </h4>
                                                            {getSourceBadge(workflow.source)}
                                                        </div>
                                                        <p className="text-gray-400 text-sm">
                                                            {workflow.description}
                                                        </p>
                                                        {workflow.category && (
                                                            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-600/50 text-gray-300 text-xs rounded">
                                                                {workflow.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
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
