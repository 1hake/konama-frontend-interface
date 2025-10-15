import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Check if OpenAI API key is configured
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        // Get the audio file from the form data
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Create form data for OpenAI API
        const openaiFormData = new FormData();
        openaiFormData.append('file', audioFile);
        openaiFormData.append('model', 'whisper-1');
        openaiFormData.append('language', 'fr'); // French language
        openaiFormData.append('response_format', 'json');

        // Call OpenAI Whisper API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: openaiFormData,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenAI API error:', errorData);
            return NextResponse.json(
                { error: 'Transcription failed' },
                { status: response.status }
            );
        }

        const transcription = await response.json();

        // Filter out common non-speech responses from Whisper
        const commonNonSpeechResponses = [
            'sous-titres réalisés par la communauté d\'amara.org',
            'sous-titres réalisés para la comunidad de amara.org',
            'sous-titres réalisés para la communauté d\'amara.org',
            'subtitles by the amara.org community',
            'merci de votre attention',
            'merci d\'avoir regardé',
        ];

        const text = transcription.text?.trim() || '';
        const lowerText = text.toLowerCase();

        // Check if it's a common non-speech response
        const isNonSpeech = commonNonSpeechResponses.some(response =>
            lowerText.includes(response.toLowerCase()) ||
            lowerText === response.toLowerCase()
        );

        if (isNonSpeech || text.length < 2) {
            return NextResponse.json({
                text: '',
                success: false,
                message: 'No clear speech detected'
            });
        }

        return NextResponse.json({
            text: transcription.text,
            success: true
        });

    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Internal server error during transcription' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed. Use POST to transcribe audio.' },
        { status: 405 }
    );
}