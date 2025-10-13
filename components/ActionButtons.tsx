interface ActionButtonsProps {
    isGenerating: boolean;
    canGenerate: boolean;
    hasContent: boolean;
    onGenerate: () => void | Promise<void>;
    onReset: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    isGenerating,
    canGenerate,
    hasContent,
    onGenerate,
    onReset
}) => {
    return (
        <div className="space-y-4 pt-6 border-t border-gray-600">
            {/* Generate Button */}
            <button
                type="submit"
                disabled={isGenerating || !canGenerate}
                tabIndex={15}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                        Génération en cours...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Générer l&apos;image
                    </>
                )}
            </button>

            {/* Reset Button */}
            {hasContent && (
                <button
                    type="button"
                    onClick={onReset}
                    disabled={isGenerating}
                    tabIndex={16}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                    Réinitialiser le formulaire
                </button>
            )}
        </div>
    );
};