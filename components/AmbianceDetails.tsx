import { FormField } from './FormField';

interface AmbianceDetailsProps {
    ambiance: string;
    details: string;
    onFieldChange: (field: string, value: string) => void;
    isGenerating: boolean;
}

export const AmbianceDetails: React.FC<AmbianceDetailsProps> = ({
    ambiance,
    details,
    onFieldChange,
    isGenerating
}) => {
    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-base font-semibold text-green-300 mb-3 flex items-center">
                <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span>
                Ambiance & Détails
            </h3>

            <FormField
                id="ambiance"
                label="Ambiance / Palette"
                type="textarea"
                value={ambiance}
                onChange={(value) => onFieldChange('ambiance', value as string)}
                disabled={isGenerating}
                rows={3}
                tabIndex={6}
                placeholder="Éclairage, couleurs, atmosphère..."
                hint="Ex: lumière rosée"
            />

            <FormField
                id="details"
                label="Détails avancés"
                type="textarea"
                value={details}
                onChange={(value) => onFieldChange('details', value as string)}
                disabled={isGenerating}
                rows={3}
                tabIndex={7}
                placeholder="Textures, matériaux, effets..."
                hint="Ex: bulles, reflets"
                className="mb-0"
            />
        </div>
    );
};