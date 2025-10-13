'use client';

import { WorkflowMetadata } from '../types';

interface WorkflowSelectorProps {
    workflows: WorkflowMetadata[];
    selectedWorkflow: string | null;
    onWorkflowChange: (workflowId: string) => void;
    isGenerating?: boolean;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
    workflows,
    selectedWorkflow,
    onWorkflowChange,
    isGenerating = false
}) => {
    const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

    return (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
                🔧 Workflow ComfyUI
            </label>

            <div className="space-y-3">
                {workflows.map((workflow) => (
                    <button
                        key={workflow.id}
                        type="button"
                        onClick={() => onWorkflowChange(workflow.id)}
                        disabled={isGenerating}
                        className={`
                            w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                            ${selectedWorkflow === workflow.id
                                ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                                : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
                            }
                            ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-white text-base">
                                        {workflow.name}
                                    </h3>
                                    {selectedWorkflow === workflow.id && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Actif
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-400 text-sm mb-2">
                                    {workflow.description}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">
                                        {workflow.category}
                                    </span>
                                    {workflow.tags?.slice(0, 3).map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                {selectedWorkflow === workflow.id ? (
                                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-500"></div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Workflow Details */}
            {selectedWorkflowData && (
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Détails du workflow</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        {selectedWorkflowData.author && (
                            <p>👤 Auteur: <span className="text-gray-300">{selectedWorkflowData.author}</span></p>
                        )}
                        {selectedWorkflowData.version && (
                            <p>📦 Version: <span className="text-gray-300">{selectedWorkflowData.version}</span></p>
                        )}
                        {selectedWorkflowData.supportsNegativePrompt && (
                            <p>✅ Support du prompt négatif</p>
                        )}
                        {selectedWorkflowData.requiredModels && selectedWorkflowData.requiredModels.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-300 mt-2 mb-1">Modèles requis:</p>
                                <ul className="list-disc list-inside pl-2 space-y-0.5">
                                    {selectedWorkflowData.requiredModels.map((model, idx) => (
                                        <li key={idx} className="text-gray-400 font-mono text-xs">{model}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
