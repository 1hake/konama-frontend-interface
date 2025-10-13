import { FormField } from './FormField';

interface CoreElementsProps {
    sujet: string;
    contexte: string;
    decor: string;
    onFieldChange: (field: string, value: string) => void;
    isGenerating: boolean;
}

export const CoreElements: React.FC<CoreElementsProps> = ({
    sujet,
    contexte,
    decor,
    onFieldChange,
    isGenerating
}) => {
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-base font-semibold text-purple-300 mb-3 flex items-center">
                <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
                Éléments Principaux
            </h3>

            <FormField
                id="sujet"
                label="Sujet"
                value={sujet}
                onChange={(value) => onFieldChange('sujet', value as string)}
                disabled={isGenerating}
                tabIndex={1}
                placeholder="Sujet principal..."
                hint="Ex: un pot de miel"
                required
            />

            <FormField
                id="contexte"
                label="Contexte / Action"
                value={contexte}
                onChange={(value) => onFieldChange('contexte', value as string)}
                disabled={isGenerating}
                tabIndex={2}
                placeholder="Contexte ou action..."
                hint="Ex: qui repose sur une planche"
            />

            <FormField
                id="decor"
                label="Décor / Arrière-plan"
                value={decor}
                onChange={(value) => onFieldChange('decor', value as string)}
                disabled={isGenerating}
                tabIndex={3}
                placeholder="Environnement et lieu..."
                hint="Ex: champ de coquelicots"
                className="mb-0"
            />
        </div>
    );
};