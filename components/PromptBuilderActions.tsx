'use client';

import { VoiceRecorder } from './VoiceRecorder';

interface PromptBuilderActionsProps {
    isGenerating: boolean;
    isEnhancing: boolean;
    hasContent: boolean;
    hasSuggestions: boolean;
    error?: string | null;
    onEnhancePrompt: () => void;
    onClearAll: () => void;
    onTranscriptionComplete: (text: string) => void;
}

export const PromptBuilderActions: React.FC<PromptBuilderActionsProps> = ({
    isGenerating,
    isEnhancing,
    hasContent,
    hasSuggestions,
    error,
    onEnhancePrompt,
    onClearAll,
    onTranscriptionComplete
}) => {
    return (
        <>
            {/* Actions */}
            <div className="mt-6 flex items-center justify-end">
                <div className="flex items-center gap-3">
                    {/* Enhance Prompt Button */}
                    <button
                        type="button"
                        onClick={onEnhancePrompt}
                        disabled={isGenerating || isEnhancing}
                        className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-purple-300 hover:text-purple-200 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400/60"
                    >
                        {isEnhancing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Amélioration...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                <span>Améliorer le prompt</span>
                            </>
                        )}
                    </button>

                    {/* Voice Recording Component */}
                    <div className="relative z-10">
                        <VoiceRecorder
                            onTranscriptionComplete={onTranscriptionComplete}
                            isGenerating={isGenerating}
                        />
                    </div>

                    {hasContent && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            disabled={isGenerating}
                            className="group flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-500/20"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Tout effacer
                        </button>
                    )}
                </div>
            </div>

            {/* Enhancement Status */}
            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-red-400 text-sm">
                        Erreur lors de l'amélioration: {error}
                    </div>
                </div>
            )}

            {hasSuggestions && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="text-purple-400 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        Suggestions IA disponibles - cliquez sur les champs colorés pour voir les propositions
                    </div>
                </div>
            )}
        </>
    );
};