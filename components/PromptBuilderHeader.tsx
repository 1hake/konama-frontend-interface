'use client';

export const PromptBuilderHeader: React.FC = () => {
    return (
        <div className="mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✨</span>
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Créer une Image
                </span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
                Cliquez sur les champs colorés pour les personnaliser • Utilisez <kbd className="px-1.5 py-0.5 text-xs bg-gray-700/80 rounded border border-gray-600">Tab</kbd> ou <kbd className="px-1.5 py-0.5 text-xs bg-gray-700/80 rounded border border-gray-600">↵</kbd> pour naviguer
            </p>
        </div>
    );
};