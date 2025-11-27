import { useState, useCallback } from 'react';
import axios from 'axios';

interface FieldSuggestions {
    sujet: string[];
    contexte: string[];
    decor: string[];
    composition: string[];
    technique: string[];
    ambiance: string[];
    details: string[];
    parametres: string[];
}

interface FieldValues {
    sujet: string;
    contexte: string;
    decor: string;
    composition: string;
    technique: string;
    ambiance: string;
    details: string;
    parametres: string;
    [key: string]: string;
}

export const usePromptEnhancement = () => {
    const [suggestions, setSuggestions] = useState<FieldSuggestions | null>(
        null
    );
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enhancePrompt = useCallback(async (currentFields: FieldValues) => {
        setIsEnhancing(true);
        setError(null);

        try {
            const response = await axios.post('/api/enhance-prompt', {
                currentFields,
            });

            const data = response.data;
            setSuggestions(data.suggestions);
            return data.suggestions;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('Error enhancing prompt:', err);
            return null;
        } finally {
            setIsEnhancing(false);
        }
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions(null);
        setError(null);
    }, []);

    const getSuggestionsForField = useCallback(
        (field: string): string[] => {
            if (!suggestions || !suggestions[field as keyof FieldSuggestions]) {
                return [];
            }
            return suggestions[field as keyof FieldSuggestions];
        },
        [suggestions]
    );

    return {
        suggestions,
        isEnhancing,
        error,
        enhancePrompt,
        clearSuggestions,
        getSuggestionsForField,
        hasSuggestions: !!suggestions,
    };
};
