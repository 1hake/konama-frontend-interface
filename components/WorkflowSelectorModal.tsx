'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { WorkflowMetadata } from '../types';

interface WorkflowSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    workflows: WorkflowMetadata[];
    selectedWorkflow: string | null;
    selectedWorkflows: string[];
    onWorkflowChange: (workflowId: string) => void;
    onWorkflowsChange: (workflowIds: string[]) => void;
    onRefresh?: () => Promise<void>;
}

export const WorkflowSelectorModal: React.FC<WorkflowSelectorModalProps> = ({
    isOpen,
    onClose,
    workflows,
    selectedWorkflow,
    selectedWorkflows,
    onWorkflowChange,
    onWorkflowsChange,
    onRefresh,
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(
        new Set()
    );

    const handleSelectWorkflow = (workflowId: string) => {
        // Toggle workflow in multi-select
        if (selectedWorkflows.includes(workflowId)) {
            const newSelection = selectedWorkflows.filter(
                id => id !== workflowId
            );
            onWorkflowsChange(newSelection);
            // If only one left, also set it as the single workflow
            if (newSelection.length === 1) {
                onWorkflowChange(newSelection[0]);
            } else if (newSelection.length === 0) {
                onWorkflowChange('');
            }
        } else {
            const newSelection = [...selectedWorkflows, workflowId];
            onWorkflowsChange(newSelection);
            // If we now have exactly 1, set it as single workflow
            if (newSelection.length === 1) {
                onWorkflowChange(newSelection[0]);
            }
        }
    };

    const selectAll = () => {
        const allIds = workflows.map(w => w.id);
        onWorkflowsChange(allIds);
    };

    const clearAll = () => {
        onWorkflowsChange([]);
        onWorkflowChange('');
    };

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Failed to refresh workflows:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const toggleWorkflowDetails = (workflowId: string) => {
        const newExpanded = new Set(expandedWorkflows);
        if (newExpanded.has(workflowId)) {
            newExpanded.delete(workflowId);
        } else {
            newExpanded.add(workflowId);
        }
        setExpandedWorkflows(newExpanded);
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
        }
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800/95 backdrop-blur-sm p-6 text-left align-middle shadow-2xl transition-all border border-gray-700">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-2xl font-bold text-white flex items-center gap-2"
                                        >
                                            <span>🔧</span>
                                            <span>Select Workflows</span>
                                        </Dialog.Title>
                                        <div className="text-gray-400 text-sm mt-1 space-y-1">
                                            <p>
                                                Choose one or multiple workflows
                                                • {selectedWorkflows.length}{' '}
                                                selected •{' '}
                                                {selectedWorkflows.length >= 2
                                                    ? '🎯 Multi Mode'
                                                    : '⚡ Single Mode'}
                                            </p>
                                            {workflows.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span>Sources:</span>
                                                    {workflows.some(
                                                        w => w.source === 'api'
                                                    ) && (
                                                        <span className="text-green-400">
                                                            ● API
                                                        </span>
                                                    )}
                                                    {workflows.some(
                                                        w =>
                                                            w.source === 'local'
                                                    ) && (
                                                        <span className="text-blue-400">
                                                            ● Local
                                                        </span>
                                                    )}
                                                    {workflows.some(
                                                        w =>
                                                            w.source ===
                                                            'auto-detected'
                                                    ) && (
                                                        <span className="text-yellow-400">
                                                            ● Auto-detected
                                                        </span>
                                                    )}
                                                    {workflows.some(
                                                        w =>
                                                            w.source ===
                                                            'fallback'
                                                    ) && (
                                                        <span className="text-red-400">
                                                            ● Fallback
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {onRefresh && (
                                            <button
                                                type="button"
                                                disabled={isRefreshing}
                                                onClick={handleRefresh}
                                                className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Refresh from ComfyUI"
                                            >
                                                <svg
                                                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
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
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                            onClick={onClose}
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                                    <div className="text-sm text-gray-400">
                                        {selectedWorkflows.length === 0 &&
                                            'Select workflows to begin'}
                                        {selectedWorkflows.length === 1 &&
                                            'Single workflow selected - Standard mode'}
                                        {selectedWorkflows.length >= 2 &&
                                            `${selectedWorkflows.length} workflows - Multi mode activated`}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAll}
                                            className="px-3 py-1.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearAll}
                                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Current Selection */}
                                {selectedWorkflowData && (
                                    <div className="mb-6 p-4 bg-purple-900/30 border-2 border-purple-500/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                                            <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="font-semibold">
                                                Workflow actuel
                                            </span>
                                        </div>
                                        <p className="text-white font-bold text-lg">
                                            {selectedWorkflowData.name}
                                        </p>
                                        <p className="text-gray-300 text-sm">
                                            {selectedWorkflowData.description}
                                        </p>
                                    </div>
                                )}

                                {/* Workflows Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {workflows.map(workflow => {
                                        const isSelected =
                                            selectedWorkflows.includes(
                                                workflow.id
                                            );
                                        return (
                                            <button
                                                key={workflow.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectWorkflow(
                                                        workflow.id
                                                    )
                                                }
                                                className={`
                                                group text-left p-5 rounded-xl border-2 transition-all duration-200
                                                ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-gray-700 shadow-lg shadow-purple-500/20'
                                                        : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-700/70 hover:shadow-lg'
                                                }
                                            `}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                                                                {workflow.name}
                                                            </h4>
                                                            {getSourceBadge(
                                                                workflow.source
                                                            )}
                                                        </div>
                                                        <p className="text-gray-400 text-sm leading-relaxed">
                                                            {
                                                                workflow.description
                                                            }
                                                        </p>
                                                        {workflow.lastFetched && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Last updated:{' '}
                                                                {new Date(
                                                                    workflow.lastFetched
                                                                ).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex-shrink-0 flex items-center gap-2">
                                                        {workflow.availableNodes &&
                                                            workflow
                                                                .availableNodes
                                                                .length > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        toggleWorkflowDetails(
                                                                            workflow.id
                                                                        );
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                                                                    title="View node details"
                                                                >
                                                                    <svg
                                                                        className={`w-4 h-4 transition-transform ${expandedWorkflows.has(workflow.id) ? 'rotate-180' : ''}`}
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M19 9l-7 7-7-7"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        {isSelected ? (
                                                            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                                                                <svg
                                                                    className="w-5 h-5 text-white"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
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
                                                    {workflow.tags
                                                        ?.slice(0, 3)
                                                        .map(tag => (
                                                            <span
                                                                key={tag}
                                                                className="px-2.5 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-md"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                </div>

                                                {/* Metadata */}
                                                <div className="space-y-1 text-xs text-gray-400">
                                                    {workflow.author && (
                                                        <p className="flex items-center gap-1.5">
                                                            <span>👤</span>
                                                            <span>
                                                                {
                                                                    workflow.author
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                    {workflow.version && (
                                                        <p className="flex items-center gap-1.5">
                                                            <span>📦</span>
                                                            <span>
                                                                Version{' '}
                                                                {
                                                                    workflow.version
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                    {workflow.supportsNegativePrompt && (
                                                        <p className="flex items-center gap-1.5 text-green-400">
                                                            <span>✅</span>
                                                            <span>
                                                                Prompt négatif
                                                                supporté
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Required Models */}
                                                {workflow.requiredModels &&
                                                    workflow.requiredModels
                                                        .length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-600">
                                                            <p className="text-xs font-semibold text-gray-300 mb-1.5">
                                                                Modèles requis:
                                                            </p>
                                                            <div className="space-y-1">
                                                                {workflow.requiredModels
                                                                    .slice(0, 2)
                                                                    .map(
                                                                        (
                                                                            model,
                                                                            idx
                                                                        ) => (
                                                                            <p
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-xs text-gray-400 font-mono truncate"
                                                                            >
                                                                                •{' '}
                                                                                {
                                                                                    model
                                                                                }
                                                                            </p>
                                                                        )
                                                                    )}
                                                                {workflow
                                                                    .requiredModels
                                                                    .length >
                                                                    2 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        +
                                                                        {workflow
                                                                            .requiredModels
                                                                            .length -
                                                                            2}{' '}
                                                                        autres...
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Available Nodes - Expandable */}
                                                {workflow.availableNodes &&
                                                    workflow.availableNodes
                                                        .length > 0 &&
                                                    expandedWorkflows.has(
                                                        workflow.id
                                                    ) && (
                                                        <div className="mt-3 pt-3 border-t border-gray-600">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-semibold text-gray-300">
                                                                    Nœuds
                                                                    ComfyUI
                                                                    disponibles:
                                                                </p>
                                                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                                                                    {
                                                                        workflow
                                                                            .availableNodes
                                                                            .length
                                                                    }{' '}
                                                                    nœuds
                                                                </span>
                                                            </div>
                                                            <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                                                                {workflow.availableNodes
                                                                    .slice(
                                                                        0,
                                                                        15
                                                                    )
                                                                    .map(
                                                                        (
                                                                            node,
                                                                            idx
                                                                        ) => (
                                                                            <p
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-xs text-gray-400 font-mono"
                                                                            >
                                                                                •{' '}
                                                                                {
                                                                                    node
                                                                                }
                                                                            </p>
                                                                        )
                                                                    )}
                                                                {workflow
                                                                    .availableNodes
                                                                    .length >
                                                                    15 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        +
                                                                        {workflow
                                                                            .availableNodes
                                                                            .length -
                                                                            15}{' '}
                                                                        autres
                                                                        nœuds...
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
                                        onClick={onClose}
                                    >
                                        Done
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
