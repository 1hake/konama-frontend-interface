'use client';

import { useState } from 'react';
import { ImageGenerationFormProps } from '../types';

interface PromptFields {
    sujet: string;
    contexte: string;
    decor: string;
    composition: string;
    technique: string;
    ambiance: string;
    details: string;
    parametres: string;
    negatifs: string;
    steps: number;
    aspectRatio: string;
    guidance: number;
    loraName: string;
    loraStrength: number;
}

export const ImageGenerationForm: React.FC<ImageGenerationFormProps> = ({
    onGenerate,
    isGenerating,
    error
}) => {
    const [fields, setFields] = useState<PromptFields>({
        sujet: '',
        contexte: '',
        decor: '',
        composition: '',
        technique: '',
        ambiance: '',
        details: '',
        parametres: '',
        negatifs: '',
        steps: 20,
        aspectRatio: '1:1 (Square)',
        guidance: 3.5,
        loraName: 'CynthiaArch.safetensors',
        loraStrength: 1.0
    });

    const updateField = (field: keyof PromptFields, value: string | number) => {
        setFields(prev => ({ ...prev, [field]: value as any }));
    };

    const constructPrompt = (): string => {
        const parts: string[] = [];

        if (fields.sujet) parts.push(fields.sujet);
        if (fields.contexte) parts.push(fields.contexte);
        if (fields.decor) parts.push(fields.decor);
        if (fields.composition) parts.push(fields.composition);
        if (fields.technique) parts.push(fields.technique);
        if (fields.ambiance) parts.push(fields.ambiance);
        if (fields.details) parts.push(fields.details);
        if (fields.parametres) parts.push(fields.parametres);

        return parts.join(', ');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const constructedPrompt = constructPrompt();
        await onGenerate(constructedPrompt, fields.negatifs, {
            steps: fields.steps,
            aspectRatio: fields.aspectRatio,
            guidance: fields.guidance,
            loraName: fields.loraName,
            loraStrength: fields.loraStrength
        });
    };

    const handleReset = () => {
        setFields({
            sujet: '',
            contexte: '',
            decor: '',
            composition: '',
            technique: '',
            ambiance: '',
            details: '',
            parametres: '',
            negatifs: '',
            steps: 20,
            aspectRatio: '1:1 (Square)',
            guidance: 3.5,
            loraName: 'CynthiaArch.safetensors',
            loraStrength: 1.0
        });
    };

    const hasAnyContent = Object.entries(fields).some(([key, value]) => {
        if (key === 'steps') {
            return value !== 20; // Check if steps is different from default
        }
        if (key === 'guidance') {
            return value !== 3.5; // Check if guidance is different from default
        }
        if (key === 'loraStrength') {
            return value !== 1.0; // Check if LoRA strength is different from default
        }
        if (key === 'aspectRatio') {
            return value !== '1:1 (Square)'; // Check if aspect ratio is different from default
        }
        if (key === 'loraName') {
            return value !== 'CynthiaArch.safetensors'; // Check if LoRA name is different from default
        }
        return typeof value === 'string' && value.trim() !== '';
    });

    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="h-full">
                <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-6">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Form Title */}
                    <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">🎨 Générateur d&apos;Images IA - Flux Krea Dev</h2>
                                <p className="text-gray-400 text-sm">Interface professionnelle pour la génération d&apos;images avec LoRA</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500">Modèle: Flux Krea Dev</span>
                                <div className="text-xs text-gray-400">Résolution dynamique • LoRA • Upscaler</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-6 min-h-0">
                        {/* Column 1 - Core Elements */}
                        <div className="xl:col-span-1 space-y-4 overflow-y-auto">
                            <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                                <h3 className="text-base font-semibold text-purple-300 mb-3 flex items-center">
                                    <span className="bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
                                    Éléments Principaux
                                </h3>

                                {/* Sujet */}
                                <div className="mb-3">
                                    <label htmlFor="sujet" className="block text-xs font-medium text-gray-300 mb-1">
                                        Sujet <span className="text-purple-400">*</span>
                                        <span className="text-gray-500 text-xs ml-1">Ex: un pot de miel</span>
                                    </label>
                                    <input
                                        id="sujet"
                                        type="text"
                                        value={fields.sujet}
                                        onChange={(e) => updateField('sujet', e.target.value)}
                                        disabled={isGenerating}
                                        tabIndex={1}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Sujet principal..."
                                    />
                                </div>

                                {/* Contexte / Action */}
                                <div className="mb-3">
                                    <label htmlFor="contexte" className="block text-xs font-medium text-gray-300 mb-1">
                                        Contexte / Action
                                        <span className="text-gray-500 text-xs ml-1">Ex: qui repose sur une planche</span>
                                    </label>
                                    <input
                                        id="contexte"
                                        type="text"
                                        value={fields.contexte}
                                        onChange={(e) => updateField('contexte', e.target.value)}
                                        disabled={isGenerating}
                                        tabIndex={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Contexte ou action..."
                                    />
                                </div>

                                {/* Décor / Arrière-plan */}
                                <div>
                                    <label htmlFor="decor" className="block text-xs font-medium text-gray-300 mb-1">
                                        Décor / Arrière-plan
                                        <span className="text-gray-500 text-xs ml-1">Ex: champ de coquelicots</span>
                                    </label>
                                    <input
                                        id="decor"
                                        type="text"
                                        value={fields.decor}
                                        onChange={(e) => updateField('decor', e.target.value)}
                                        disabled={isGenerating}
                                        tabIndex={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Environnement et lieu..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2 - Composition & Technique */}
                        <div className="xl:col-span-1 space-y-4 overflow-y-auto">
                            <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                                <h3 className="text-base font-semibold text-blue-300 mb-3 flex items-center">
                                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">2</span>
                                    Composition & Technique
                                </h3>

                                {/* Composition */}
                                <div className="mb-3">
                                    <label htmlFor="composition" className="block text-xs font-medium text-gray-300 mb-1">
                                        Composition / Point focal
                                        <span className="text-gray-500 text-xs ml-1">Ex: angle trois-quarts</span>
                                    </label>
                                    <textarea
                                        id="composition"
                                        value={fields.composition}
                                        onChange={(e) => updateField('composition', e.target.value)}
                                        disabled={isGenerating}
                                        rows={3}
                                        tabIndex={4}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                        placeholder="Cadrage, angle de vue..."
                                    />
                                </div>

                                {/* Technique */}
                                <div>
                                    <label htmlFor="technique" className="block text-xs font-medium text-gray-300 mb-1">
                                        Technique / Médium
                                        <span className="text-gray-500 text-xs ml-1">Ex: packshot, 85mm</span>
                                    </label>
                                    <textarea
                                        id="technique"
                                        value={fields.technique}
                                        onChange={(e) => updateField('technique', e.target.value)}
                                        disabled={isGenerating}
                                        rows={3}
                                        tabIndex={5}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                        placeholder="Style photo, artistique..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 3 - Ambiance & Details */}
                        <div className="xl:col-span-1 2xl:col-span-1 space-y-4 overflow-y-auto">
                            <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                                <h3 className="text-base font-semibold text-green-300 mb-3 flex items-center">
                                    <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span>
                                    Ambiance & Détails
                                </h3>

                                {/* Ambiance */}
                                <div className="mb-3">
                                    <label htmlFor="ambiance" className="block text-xs font-medium text-gray-300 mb-1">
                                        Ambiance / Palette
                                        <span className="text-gray-500 text-xs ml-1">Ex: lumière rosée</span>
                                    </label>
                                    <textarea
                                        id="ambiance"
                                        value={fields.ambiance}
                                        onChange={(e) => updateField('ambiance', e.target.value)}
                                        disabled={isGenerating}
                                        rows={3}
                                        tabIndex={6}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                        placeholder="Éclairage, couleurs, atmosphère..."
                                    />
                                </div>

                                {/* Détails avancés */}
                                <div>
                                    <label htmlFor="details" className="block text-xs font-medium text-gray-300 mb-1">
                                        Détails avancés
                                        <span className="text-gray-500 text-xs ml-1">Ex: bulles, reflets</span>
                                    </label>
                                    <textarea
                                        id="details"
                                        value={fields.details}
                                        onChange={(e) => updateField('details', e.target.value)}
                                        disabled={isGenerating}
                                        rows={3}
                                        tabIndex={7}
                                        className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                        placeholder="Textures, matériaux, effets..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 4 - Technical Parameters */}
                        <div className="xl:col-span-3 2xl:col-span-1 space-y-4 overflow-y-auto">
                            <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                                <h3 className="text-base font-semibold text-orange-300 mb-3 flex items-center">
                                    <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">4</span>
                                    Paramètres Flux & LoRA
                                </h3>

                                {/* Grid for compact technical parameters */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {/* Paramètres de rendu */}
                                    <div className="lg:col-span-2">
                                        <label htmlFor="parametres" className="block text-xs font-medium text-gray-300 mb-1">
                                            Paramètres de rendu
                                            <span className="text-gray-500 text-xs ml-1">Ex: PNG, HDR</span>
                                        </label>
                                        <input
                                            id="parametres"
                                            type="text"
                                            value={fields.parametres}
                                            onChange={(e) => updateField('parametres', e.target.value)}
                                            disabled={isGenerating}
                                            tabIndex={8}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Format, qualité..."
                                        />
                                    </div>

                                    {/* Nombre d'étapes */}
                                    <div>
                                        <label htmlFor="steps" className="block text-xs font-medium text-gray-300 mb-1">
                                            Étapes
                                            <span className="text-gray-500 text-xs ml-1">(10-50)</span>
                                        </label>
                                        <input
                                            id="steps"
                                            type="number"
                                            min="10"
                                            max="50"
                                            value={fields.steps}
                                            onChange={(e) => updateField('steps', parseInt(e.target.value) || 20)}
                                            disabled={isGenerating}
                                            tabIndex={9}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="20"
                                        />
                                    </div>

                                    {/* Guide de prompt */}
                                    <div>
                                        <label htmlFor="guidance" className="block text-xs font-medium text-gray-300 mb-1">
                                            Guidance
                                            <span className="text-gray-500 text-xs ml-1">(1.0-10.0)</span>
                                        </label>
                                        <input
                                            id="guidance"
                                            type="number"
                                            min="1.0"
                                            max="10.0"
                                            step="0.1"
                                            value={fields.guidance}
                                            onChange={(e) => updateField('guidance', parseFloat(e.target.value) || 3.5)}
                                            disabled={isGenerating}
                                            tabIndex={11}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="3.5"
                                        />
                                    </div>

                                    {/* Format d'image */}
                                    <div className="lg:col-span-2">
                                        <label htmlFor="aspectRatio" className="block text-xs font-medium text-gray-300 mb-1">
                                            Format d'image
                                            <span className="text-gray-500 text-xs ml-1">Ratio largeur/hauteur</span>
                                        </label>
                                        <select
                                            id="aspectRatio"
                                            value={fields.aspectRatio}
                                            onChange={(e) => updateField('aspectRatio', e.target.value)}
                                            disabled={isGenerating}
                                            tabIndex={10}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="1:1 (Square)">1:1 (Carré)</option>
                                            <option value="16:9 (Wide)">16:9 (Paysage large)</option>
                                            <option value="9:16 (Slim Vertical)">9:16 (Vertical mince)</option>
                                            <option value="4:3 (Standard)">4:3 (Standard)</option>
                                            <option value="3:4 (Portrait)">3:4 (Portrait)</option>
                                            <option value="21:9 (Ultrawide)">21:9 (Ultra-large)</option>
                                        </select>
                                    </div>

                                    {/* LoRA */}
                                    <div>
                                        <label htmlFor="loraName" className="block text-xs font-medium text-gray-300 mb-1">
                                            LoRA
                                            <span className="text-gray-500 text-xs ml-1">Style</span>
                                        </label>
                                        <select
                                            id="loraName"
                                            value={fields.loraName}
                                            onChange={(e) => updateField('loraName', e.target.value)}
                                            disabled={isGenerating}
                                            tabIndex={12}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="CynthiaArch.safetensors">CynthiaArch</option>
                                            <option value="p1x4r0ma_woman.safetensors">Pixaroma</option>
                                            <option value="">Aucun</option>
                                        </select>
                                    </div>

                                    {/* Force du LoRA */}
                                    <div>
                                        <label htmlFor="loraStrength" className="block text-xs font-medium text-gray-300 mb-1">
                                            Force LoRA
                                            <span className="text-gray-500 text-xs ml-1">(0.0-2.0)</span>
                                        </label>
                                        <input
                                            id="loraStrength"
                                            type="number"
                                            min="0.0"
                                            max="2.0"
                                            step="0.1"
                                            value={fields.loraStrength}
                                            onChange={(e) => updateField('loraStrength', parseFloat(e.target.value) || 1.0)}
                                            disabled={isGenerating}
                                            tabIndex={13}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="1.0"
                                        />
                                    </div>

                                    {/* Négatifs */}
                                    <div className="lg:col-span-2">
                                        <label htmlFor="negatifs" className="block text-xs font-medium text-gray-300 mb-1">
                                            Négatifs (à éviter)
                                            <span className="text-gray-500 text-xs ml-1">Ex: texte, watermark</span>
                                        </label>
                                        <textarea
                                            id="negatifs"
                                            value={fields.negatifs}
                                            onChange={(e) => updateField('negatifs', e.target.value)}
                                            disabled={isGenerating}
                                            rows={2}
                                            tabIndex={14}
                                            className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                            placeholder="Éléments à éviter..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview du prompt */}
                            {hasAnyContent && (
                                <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600">
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Aperçu du prompt :</h4>
                                    <p className="text-sm text-gray-400 italic">
                                        {constructPrompt() || 'Votre prompt apparaîtra ici...'}
                                    </p>
                                    {fields.negatifs && (
                                        <div className="mt-2 pt-2 border-t border-gray-600">
                                            <span className="text-xs font-medium text-gray-400">Négatifs: </span>
                                            <span className="text-sm text-red-400">{fields.negatifs}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-6 border-t border-gray-600">
                        {/* Generate Button */}
                        <button
                            type="submit"
                            disabled={isGenerating || !fields.sujet.trim()}
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
                        {hasAnyContent && (
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isGenerating}
                                tabIndex={16}
                                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                            >
                                Réinitialiser le formulaire
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};