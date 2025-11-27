/**
 * FunnelTimeline Component
 *
 * Visual timeline for navigating between funnel steps
 */

'use client';

import { FunnelStep } from '@/types/funnel';

interface FunnelTimelineProps {
    steps: FunnelStep[];
    currentStepIndex: number;
    onStepClick: (stepIndex: number) => void;
}

export function FunnelTimeline({
    steps,
    currentStepIndex,
    onStepClick,
}: FunnelTimelineProps) {
    const getStepStatus = (step: FunnelStep) => {
        switch (step.status) {
            case 'completed':
                return { color: 'bg-green-500', icon: 'check' };
            case 'generating':
                return {
                    color: 'bg-yellow-500 animate-pulse',
                    icon: 'spinner',
                };
            case 'selecting':
                return { color: 'bg-purple-500', icon: 'cursor' };
            default:
                return { color: 'bg-white/20', icon: 'dot' };
        }
    };

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 shadow-lg">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 px-1">
                Pipeline
            </h3>

            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-5 left-5 right-5 h-[2px] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

                {/* Steps */}
                <div className="relative flex items-start justify-between gap-2">
                    {steps.map((step, index) => {
                        const status = getStepStatus(step);
                        const isCurrent = index === currentStepIndex;

                        return (
                            <button
                                key={step.id}
                                onClick={() => onStepClick(index)}
                                className="flex flex-col items-center group relative transition-all duration-200 ease-out hover:scale-105"
                                style={{ flex: '0 0 auto' }}
                            >
                                {/* Step Circle */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ease-out ${
                                        isCurrent
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40 scale-110'
                                            : status.color + ' shadow-md'
                                    }`}
                                >
                                    {status.icon === 'check' && (
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                    {status.icon === 'spinner' && (
                                        <div className="w-5 h-5">
                                            <svg
                                                className="w-full h-full text-white animate-spin"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-20"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    className="opacity-90"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    {status.icon === 'cursor' && (
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                            />
                                        </svg>
                                    )}
                                    {status.icon === 'dot' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="mt-3 text-center">
                                    <div
                                        className={`text-sm font-semibold transition-colors ${
                                            isCurrent
                                                ? 'text-blue-400'
                                                : 'text-white/50'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="text-[11px] text-white/30 font-medium mt-0.5">
                                        {step.imageCount}
                                    </div>
                                </div>

                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform group-hover:-translate-y-1">
                                    <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 whitespace-nowrap shadow-xl font-medium">
                                        {step.status === 'completed' &&
                                            'Completed'}
                                        {step.status === 'generating' &&
                                            'Generating...'}
                                        {step.status === 'selecting' &&
                                            'Ready for selection'}
                                        {step.status === 'pending' && 'Pending'}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
