'use client';


// import { Fragment } from 'react';

interface PromptField {
    name: string;
    label: string;
    placeholder: string;
    example: string;
    icon: string;
}

interface UnifiedPromptBuilderProps {
    fields: {
        sujet: string;
        contexte: string;
        decor: string;
        composition: string;
        technique: string;
        ambiance: string;
        details: string;
        parametres: string;
    };
    onFieldChange: (field: string, value: string) => void;
    isGenerating: boolean;
}

const promptFields: PromptField[] = [
    {
        name: 'sujet',
        label: 'Sujet Principal',
        placeholder: "Le sujet principal de l'image",
        example: 'un pot de miel, une montagne enneigée, un chat noir',
        icon: '🎯',
    },
    {
        name: 'contexte',
        label: 'Contexte',
        placeholder: "Le contexte ou l'environnement",
        example:
            'dans une cuisine rustique, au coucher du soleil, sous la pluie',
        icon: '🌍',
    },
    {
        name: 'decor',
        label: 'Décor',
        placeholder: 'Éléments de décor',
        example: 'fleurs sauvages, arbres anciens, lampes vintage',
        icon: '🎨',
    },
    {
        name: 'composition',
        label: 'Composition',
        placeholder: "Composition de l'image",
        example: 'plan rapproché, vue panoramique, angle faible',
        icon: '📐',
    },
    {
        name: 'technique',
        label: 'Technique',
        placeholder: 'Style artistique ou technique',
        example: 'aquarelle, photographie macro, rendu 3D',
        icon: '🖌️',
    },
    {
        name: 'ambiance',
        label: 'Ambiance',
        placeholder: 'Ambiance et atmosphère',
        example: 'atmosphère chaleureuse, lumière douce, ambiance mystérieuse',
        icon: '✨',
    },
    {
        name: 'details',
        label: 'Détails',
        placeholder: 'Détails spécifiques',
        example: 'haute qualité, ultra détaillé, 8k',
        icon: '🔍',
    },
    {
        name: 'parametres',
        label: 'Paramètres',
        placeholder: 'Paramètres techniques',
        example: 'masterpiece, best quality, professional',
        icon: '⚙️',
    },
];

export const UnifiedPromptBuilder: React.FC<UnifiedPromptBuilderProps> = ({
    fields,
    onFieldChange,
    isGenerating,
}) => {
    return (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📝</span>
                    <span>Constructeur de Prompt</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                    Composez votre prompt en remplissant les champs ci-dessous
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {promptFields.map(field => (
                    <div key={field.name} className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                                <span>{field.icon}</span>
                                <span>{field.label}</span>
                            </label>


                        </div>

                        <input
                            type="text"
                            value={fields[field.name as keyof typeof fields]}
                            onChange={e =>
                                onFieldChange(field.name, e.target.value)
                            }
                            placeholder={field.placeholder}
                            disabled={isGenerating}
                            className={`
                                w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg
                                text-white placeholder-gray-500 text-sm
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                transition-all duration-200
                                ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}
                            `}
                        />

                        {/* Character Count */}
                        {fields[field.name as keyof typeof fields] && (
                            <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                                {
                                    fields[field.name as keyof typeof fields]
                                        .length
                                }
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        💡 Astuce: Plus vous êtes précis, meilleur sera le
                        résultat
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            promptFields.forEach(field =>
                                onFieldChange(field.name, '')
                            );
                        }}
                        disabled={isGenerating}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Effacer tout
                    </button>
                </div>
            </div>
        </div>
    );
};
