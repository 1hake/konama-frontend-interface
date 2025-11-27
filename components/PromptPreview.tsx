interface PromptPreviewProps {
    constructedPrompt: string;
    negatifs: string;
    hasContent: boolean;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
    constructedPrompt,
    negatifs,
    hasContent,
}) => {
    if (!hasContent) {
        return null;
    }

    return (
        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
                Aperçu du prompt :
            </h4>
            <p className="text-sm text-gray-400 italic">
                {constructedPrompt || 'Votre prompt apparaîtra ici...'}
            </p>
            {negatifs && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                    <span className="text-xs font-medium text-gray-400">
                        Négatifs:{' '}
                    </span>
                    <span className="text-sm text-red-400">{negatifs}</span>
                </div>
            )}
        </div>
    );
};
