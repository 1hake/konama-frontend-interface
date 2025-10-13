'use client';

import { useState, useRef } from 'react';

interface VoiceRecordingState {
    isRecording: boolean;
    isProcessing: boolean;
    error: string | null;
}

interface VoiceRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    isGenerating: boolean;
    className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onTranscriptionComplete,
    isGenerating,
    className = ''
}) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [voiceState, setVoiceState] = useState<VoiceRecordingState>({
        isRecording: false,
        isProcessing: false,
        error: null
    });

    const startRecording = async () => {
        try {
            setVoiceState(prev => ({ ...prev, error: null }));

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await processAudioTranscription(audioBlob);

                // Stop all tracks to turn off microphone
                stream.getTracks().forEach(track => track.stop());
            });

            mediaRecorder.start();
            setVoiceState(prev => ({ ...prev, isRecording: true }));
        } catch (error) {
            console.error('Error starting recording:', error);
            setVoiceState(prev => ({
                ...prev,
                error: 'Impossible d\'accéder au microphone. Vérifiez les permissions.'
            }));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && voiceState.isRecording) {
            mediaRecorderRef.current.stop();
            setVoiceState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
        }
    };

    const processAudioTranscription = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la transcription');
            }

            const { text } = await response.json();

            if (text && text.trim()) {
                onTranscriptionComplete(text.trim());
            }
        } catch (error) {
            console.error('Error transcribing audio:', error);
            setVoiceState(prev => ({
                ...prev,
                error: 'Erreur lors de la transcription audio'
            }));
        } finally {
            setVoiceState(prev => ({ ...prev, isProcessing: false }));
        }
    };

    const handleVoiceButtonClick = () => {
        if (voiceState.isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className={className}>
            {/* Voice Recording Button */}
            <button
                type="button"
                onClick={handleVoiceButtonClick}
                disabled={isGenerating || voiceState.isProcessing}
                className={`
                    group relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 
                    ${voiceState.isRecording
                        ? 'bg-red-500/20 border-red-400/60 text-red-400 hover:bg-red-500/30'
                        : voiceState.isProcessing
                            ? 'bg-yellow-500/20 border-yellow-400/60 text-yellow-400'
                            : 'bg-purple-500/20 border-purple-400/60 text-purple-400 hover:bg-purple-500/30'
                    }
                    border-2 hover:scale-105 shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    focus:outline-none focus:ring-2 focus:ring-purple-400/50
                `}
                title={voiceState.isRecording ? 'Arrêter l\'enregistrement' : voiceState.isProcessing ? 'Transcription en cours...' : 'Enregistrer avec la voix'}
            >
                {voiceState.isProcessing ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : voiceState.isRecording ? (
                    <>
                        <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v6H6V4z" clipRule="evenodd" />
                        </svg>
                    </>
                ) : (
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                )}
                <span className="text-sm">
                    {voiceState.isRecording ? 'Stop' : voiceState.isProcessing ? 'Transcription...' : 'Voix'}
                </span>

                {voiceState.isRecording && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                )}
            </button>

            {/* Error Display */}
            {voiceState.error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-red-400 font-medium text-sm">Erreur d'enregistrement</h4>
                            <p className="text-red-300 text-sm mt-1">{voiceState.error}</p>
                            <button
                                onClick={() => setVoiceState(prev => ({ ...prev, error: null }))}
                                className="text-red-400 hover:text-red-300 text-xs underline mt-2 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};