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
        return { color: 'bg-yellow-500 animate-pulse', icon: 'spinner' };
      case 'selecting':
        return { color: 'bg-purple-500', icon: 'cursor' };
      default:
        return { color: 'bg-white/20', icon: 'dot' };
    }
  };

  return (
    <div className="glass rounded-xl border border-white/10 p-3">
      <h3 className="text-sm font-medium text-white/80 mb-3 px-2">Pipeline Progress</h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10" />

        {/* Steps */}
        <div className="relative flex items-start justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isCurrent = index === currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(index)}
                className="flex flex-col items-center group relative"
                style={{ flex: '0 0 auto' }}
              >
                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full border-2 ${isCurrent ? 'border-purple-500 bg-purple-500' : 'border-gray-900 ' + status.color
                    } flex items-center justify-center relative z-10 transition-all group-hover:scale-110`}
                >
                  {status.icon === 'check' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {status.icon === 'spinner' && (
                    <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {status.icon === 'cursor' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  )}
                  {status.icon === 'dot' && (
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <div className={`text-xs font-medium ${isCurrent ? 'text-purple-400' : 'text-white/60'}`}>
                    #{index + 1}
                  </div>
                  <div className="text-[10px] text-white/40">
                    {step.imageCount}
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 border border-white/20 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap">
                    {step.status === 'completed' && 'Completed'}
                    {step.status === 'generating' && 'Generating...'}
                    {step.status === 'selecting' && 'Ready for selection'}
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
