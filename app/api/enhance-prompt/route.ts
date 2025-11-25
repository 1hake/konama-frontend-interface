import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
    try {
        const { currentFields } = await request.json();

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const prompt = `Tu es un assistant expert en création de prompts narratifs pour GPT-Image-1 (Sora).
Ta tâche : remplir un objet JSON nommé fields, composé des clés suivantes : sujet, contexte, decor, composition, technique, ambiance, details, parametres.
Pour chaque clé, produis un tableau de 3 propositions précises et évocatrices (phrases courtes de 5–15 mots), sans doublon ni adjectif creux.
Le ton doit être visuel, technique et narratif, préparant à la génération d'un prompt complet selon le schéma : sujet → action/contexte → décor → composition → médium/technique → ambiance/palette → détails avancés → négatifs.
Les termes doivent être compatibles entre eux et ne pas se contredire (ex. pas de lexique photo pour une gravure).
Exclus : format, ratio, texte, watermark, artefacts numériques.
Le rendu final est du pur texte brut, structuré en JSON avec des guillemets doubles.

${currentFields ? `Voici les champs actuels à améliorer : ${JSON.stringify(currentFields)}` : ''}

Réponds uniquement avec le JSON, sans autre texte.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.8,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        // Parse the JSON response
        let suggestions: FieldSuggestions;
        try {
            suggestions = JSON.parse(content);
        } catch {
            // If JSON parsing fails, try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse suggestions from OpenAI response');
            }
        }

        // Validate the structure
        const requiredFields = ['sujet', 'contexte', 'decor', 'composition', 'technique', 'ambiance', 'details', 'parametres'];
        for (const field of requiredFields) {
            if (!suggestions[field as keyof FieldSuggestions] || !Array.isArray(suggestions[field as keyof FieldSuggestions])) {
                throw new Error(`Invalid suggestions structure: missing or invalid field ${field}`);
            }
        }

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error enhancing prompt:', error);
        return NextResponse.json(
            { error: 'Failed to enhance prompt' },
            { status: 500 }
        );
    }
}