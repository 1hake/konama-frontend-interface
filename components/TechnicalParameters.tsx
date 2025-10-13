import { FormField } from './FormField';

interface TechnicalParametersProps {
    parametres: string;
    steps: number;
    guidance: number;
    aspectRatio: string;
    loraName: string;
    loraStrength: number;
    negatifs: string;
    onFieldChange: (field: string, value: string | number) => void;
    isGenerating: boolean;
}

export const TechnicalParameters: React.FC<TechnicalParametersProps> = ({
    parametres,
    steps,
    guidance,
    aspectRatio,
    loraName,
    loraStrength,
    negatifs,
    onFieldChange,
    isGenerating
}) => {
    const aspectRatioOptions = [
        { value: "1:1 (Square)", label: "1:1 (Carré)" },
        { value: "16:9 (Wide)", label: "16:9 (Paysage large)" },
        { value: "9:16 (Slim Vertical)", label: "9:16 (Vertical mince)" },
        { value: "4:3 (Standard)", label: "4:3 (Standard)" },
        { value: "3:4 (Portrait)", label: "3:4 (Portrait)" },
        { value: "21:9 (Ultrawide)", label: "21:9 (Ultra-large)" }
    ];

    const loraOptions = [
        { value: "CynthiaArch.safetensors", label: "CynthiaArch" },
        { value: "p1x4r0ma_woman.safetensors", label: "Pixaroma" },
        { value: "", label: "Aucun" }
    ];

    return (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-base font-semibold text-orange-300 mb-3 flex items-center">
                <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">4</span>
                Paramètres Flux & LoRA
            </h3>

            {/* Grid for compact technical parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="lg:col-span-2">
                    <FormField
                        id="parametres"
                        label="Paramètres de rendu"
                        value={parametres}
                        onChange={(value) => onFieldChange('parametres', value as string)}
                        disabled={isGenerating}
                        tabIndex={8}
                        placeholder="Format, qualité..."
                        hint="Ex: PNG, HDR"
                    />
                </div>

                <FormField
                    id="steps"
                    label="Étapes"
                    type="number"
                    value={steps}
                    onChange={(value) => onFieldChange('steps', value as number)}
                    disabled={isGenerating}
                    tabIndex={9}
                    placeholder="20"
                    hint="(10-50)"
                    min={10}
                    max={50}
                />

                <FormField
                    id="guidance"
                    label="Guidance"
                    type="number"
                    value={guidance}
                    onChange={(value) => onFieldChange('guidance', value as number)}
                    disabled={isGenerating}
                    tabIndex={11}
                    placeholder="3.5"
                    hint="(1.0-10.0)"
                    min={1.0}
                    max={10.0}
                    step={0.1}
                />

                <div className="lg:col-span-2">
                    <FormField
                        id="aspectRatio"
                        label="Format d'image"
                        type="select"
                        value={aspectRatio}
                        onChange={(value) => onFieldChange('aspectRatio', value as string)}
                        disabled={isGenerating}
                        tabIndex={10}
                        hint="Ratio largeur/hauteur"
                        options={aspectRatioOptions}
                    />
                </div>

                <FormField
                    id="loraName"
                    label="LoRA"
                    type="select"
                    value={loraName}
                    onChange={(value) => onFieldChange('loraName', value as string)}
                    disabled={isGenerating}
                    tabIndex={12}
                    hint="Style"
                    options={loraOptions}
                />

                <FormField
                    id="loraStrength"
                    label="Force LoRA"
                    type="number"
                    value={loraStrength}
                    onChange={(value) => onFieldChange('loraStrength', value as number)}
                    disabled={isGenerating}
                    tabIndex={13}
                    placeholder="1.0"
                    hint="(0.0-2.0)"
                    min={0.0}
                    max={2.0}
                    step={0.1}
                />

                <div className="lg:col-span-2">
                    <FormField
                        id="negatifs"
                        label="Négatifs (à éviter)"
                        type="textarea"
                        value={negatifs}
                        onChange={(value) => onFieldChange('negatifs', value as string)}
                        disabled={isGenerating}
                        rows={2}
                        tabIndex={14}
                        placeholder="Éléments à éviter..."
                        hint="Ex: texte, watermark"
                        className="mb-0"
                    />
                </div>
            </div>
        </div>
    );
};