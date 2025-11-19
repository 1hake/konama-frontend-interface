/**
 * FunnelWorkflowSelector Component
 * 
 * Multi-select modal for workflow selection in funnels
 */

'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export interface Workflow {
  id: string;
  name?: string;
}

interface FunnelWorkflowSelectorProps {
  workflows: Workflow[];
  selectedWorkflows: string[];
  onChange: (workflowIds: string[]) => void;
  disabled?: boolean;
}

export function FunnelWorkflowSelector({
  workflows,
  selectedWorkflows,
  onChange,
  disabled = false,
}: FunnelWorkflowSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWorkflow = (workflowId: string) => {
    if (selectedWorkflows.includes(workflowId)) {
      onChange(selectedWorkflows.filter(id => id !== workflowId));
    } else {
      onChange([...selectedWorkflows, workflowId]);
    }
  };

  const selectAll = () => {
    onChange(workflows.map(w => w.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getWorkflowName = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    return workflow?.name || id;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex-shrink-0 p-2.5 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border active:scale-95 bg-purple-500/20 hover:bg-purple-500/30 text-white border-purple-400/30 hover:border-purple-400/50"
      >
        <div className="flex items-center gap-2 px-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {selectedWorkflows.length > 0 && (
            <span className="text-sm">
              {selectedWorkflows.length}
            </span>
          )}
        </div>
      </button>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800/95 backdrop-blur-sm p-6 text-left align-middle shadow-2xl transition-all border border-gray-700">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <Dialog.Title as="h3" className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Select Workflows</span>
                      </Dialog.Title>
                      <p className="text-gray-400 text-sm mt-1">
                        Choose multiple workflows for your funnel ({selectedWorkflows.length} selected)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                    <span className="text-sm text-gray-400">
                      {selectedWorkflows.length} of {workflows.length} workflows selected
                    </span>
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

                  {/* Workflow Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                    {workflows.length === 0 ? (
                      <div className="col-span-2 px-4 py-12 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No workflows available</p>
                      </div>
                    ) : (
                      workflows.map(workflow => {
                        const isSelected = selectedWorkflows.includes(workflow.id);
                        return (
                          <button
                            key={workflow.id}
                            type="button"
                            onClick={() => toggleWorkflow(workflow.id)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-700/70'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-base mb-1 truncate">
                                  {workflow.name || workflow.id}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {workflow.id}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isSelected ? (
                                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
