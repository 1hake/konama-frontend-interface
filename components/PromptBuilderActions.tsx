'use client';

interface PromptBuilderActionsProps {
    isGenerating: boolean;
    isEnhancing: boolean;
    hasContent: boolean;
    hasSuggestions: boolean;
    error?: string | null;
    onEnhancePrompt: () => void;
    onClearAll: () => void;
}

export const PromptBuilderActions: React.FC<PromptBuilderActionsProps> = ({
    isGenerating,
    // isEnhancing,
    hasContent,
    hasSuggestions,
    error,
    // onEnhancePrompt,
    onClearAll,
}) => {
    return (
        <>
            {/* Actions */}
            <div className="mt-3 flex items-center justify-end">
                <div className="flex items-center gap-2">
                    Enhance Prompt Button - Simplified
                    {/* <button
                        type="button"
                        onClick={onEnhancePrompt}
                        disabled={isGenerating || isEnhancing}
                        title="Améliorer le prompt avec l'IA"
                        className="group flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isEnhancing ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
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
                                <span>...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                </svg>
                                <span>Améliorer</span>
                            </>
                        )}
                    </button> */}

                    {hasContent && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            disabled={isGenerating}
                            title="Effacer tous les champs"
                            className="group flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-400/30 hover:border-red-400/50 active:scale-95"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Effacer
                        </button>
                    )}
                </div>
            </div>

            {/* Enhancement Status */}
            {error && (
                <div className="mt-4 p-4 glass border border-red-400/30 rounded-2xl">
                    <div className="text-red-300 text-sm font-light">
                        Erreur lors de l&apos;amélioration: {error}
                    </div>
                </div>
            )}

            {hasSuggestions && (
                <div className="mt-4 p-4 glass border border-blue-400/30 rounded-2xl">
                    <div className="text-blue-300 text-sm font-light flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        Suggestions IA disponibles - cliquez sur les champs
                        colorés pour voir les propositions
                    </div>
                </div>
            )}
        </>
    );
};
