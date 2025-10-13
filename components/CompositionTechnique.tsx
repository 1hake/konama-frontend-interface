import { FormField } from './FormField';

interface CompositionTechniqueProps {
    composition: string;
    technique: string;
    onFieldChange: (field: string, value: string) => void;
    isGenerating: boolean;
}

export const CompositionTechnique: React.FC<CompositionTechniqueProps> = ({
    composition,
    technique,
    onFieldChange,
    isGenerating
}) => {
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-base font-semibold text-blue-300 mb-3 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
                Composition & Technique
            </h3>

            <FormField
                id="composition"
                label="Composition / Point focal"
                type="textarea"
                value={composition}
                onChange={(value) => onFieldChange('composition', value as string)}
                disabled={isGenerating}
                rows={3}
                tabIndex={4}
                placeholder="Cadrage, angle de vue..."
                hint="Ex: angle trois-quarts"
            />

            <FormField
                id="technique"
                label="Technique / Médium"
                type="textarea"
                value={technique}
                onChange={(value) => onFieldChange('technique', value as string)}
                disabled={isGenerating}
                rows={3}
                tabIndex={5}
                placeholder="Style photo, artistique..."
                hint="Ex: packshot, 85mm"
                className="mb-0"
            />
        </div>
    );
};