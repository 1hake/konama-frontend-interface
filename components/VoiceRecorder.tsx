'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceRecordingState {
    isRecording: boolean;
    isProcessing: boolean;
    error: string | null;
    recordingStartTime?: number;
}

interface VoiceRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    isGenerating: boolean;
    className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onTranscriptionComplete,
    isGenerating,
    className = '',
}) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [voiceState, setVoiceState] = useState<VoiceRecordingState>({
        isRecording: false,
        isProcessing: false,
        error: null,
    });

    // Check for compatibility on mount
    useEffect(() => {
        const checkCompatibility = () => {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setVoiceState(prev => ({
                    ...prev,
                    error: "Votre navigateur ne supporte pas l'enregistrement audio. Utilisez Chrome, Firefox ou Safari récent.",
                }));
                return;
            }

            if (!window.MediaRecorder) {
                setVoiceState(prev => ({
                    ...prev,
                    error: 'MediaRecorder non supporté. Mettez à jour votre navigateur.',
                }));
                return;
            }

            // Check if we're on HTTPS or localhost
            const isSecure =
                window.location.protocol === 'https:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (!isSecure) {
                setVoiceState(prev => ({
                    ...prev,
                    error: "L'enregistrement audio nécessite une connexion sécurisée (HTTPS).",
                }));
            }
        };

        checkCompatibility();
    }, []);

    const startRecording = async () => {
        try {
            setVoiceState(prev => ({ ...prev, error: null }));

            // Check for MediaRecorder support
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    'MediaRecorder API not supported in this browser'
                );
            }

            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder not supported in this browser');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            // Get supported MIME types
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus',
                'audio/wav',
            ];

            let selectedMimeType = '';
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }

            if (!selectedMimeType) {
                throw new Error('No supported audio format found');
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType,
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            mediaRecorder.addEventListener('stop', async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: selectedMimeType,
                });
                await processAudioTranscription(audioBlob);

                // Stop all tracks to turn off microphone
                stream.getTracks().forEach(track => track.stop());
            });

            mediaRecorder.addEventListener('error', event => {
                console.error('MediaRecorder error:', event);
                setVoiceState(prev => ({
                    ...prev,
                    error: "Erreur lors de l'enregistrement audio",
                    isRecording: false,
                }));
            });

            // Start recording with chunks every 1000ms for better quality
            mediaRecorder.start(1000);
            setVoiceState(prev => ({
                ...prev,
                isRecording: true,
                recordingStartTime: Date.now(),
            }));
        } catch (error) {
            console.error('Error starting recording:', error);
            let errorMessage = "Impossible d'accéder au microphone.";

            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage =
                        "Permission microphone refusée. Veuillez autoriser l'accès au microphone.";
                } else if (error.name === 'NotFoundError') {
                    errorMessage =
                        'Aucun microphone trouvé. Vérifiez votre matériel audio.';
                } else if (error.name === 'NotSupportedError') {
                    errorMessage =
                        'Enregistrement audio non supporté par ce navigateur.';
                } else if (error.message.includes('MediaRecorder')) {
                    errorMessage =
                        "Votre navigateur ne supporte pas l'enregistrement audio.";
                }
            }

            setVoiceState(prev => ({
                ...prev,
                error: errorMessage,
            }));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && voiceState.isRecording) {
            // Check minimum recording time (1.5 seconds)
            const recordingDuration =
                Date.now() - (voiceState.recordingStartTime || 0);

            if (recordingDuration < 1500) {
                setVoiceState(prev => ({
                    ...prev,
                    error: 'Enregistrement trop court. Maintenez le bouton enfoncé au moins 1,5 seconde.',
                    isRecording: false,
                }));

                // Stop the recorder anyway to clean up
                mediaRecorderRef.current.stop();
                return;
            }

            mediaRecorderRef.current.stop();
            setVoiceState(prev => ({
                ...prev,
                isRecording: false,
                isProcessing: true,
            }));
        }
    };

    const processAudioTranscription = async (audioBlob: Blob) => {
        try {
            // Determine file extension based on blob type
            let fileName = 'recording.webm';
            if (audioBlob.type.includes('mp4')) {
                fileName = 'recording.mp4';
            } else if (audioBlob.type.includes('ogg')) {
                fileName = 'recording.ogg';
            } else if (audioBlob.type.includes('wav')) {
                fileName = 'recording.wav';
            }

            const formData = new FormData();
            formData.append('audio', audioBlob, fileName);

            console.log(
                `Sending audio file: ${fileName}, size: ${audioBlob.size} bytes, type: ${audioBlob.type}`
            );

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Transcription API error:', errorText);

                if (response.status === 413) {
                    throw new Error('Fichier audio trop volumineux');
                } else if (response.status === 500) {
                    throw new Error('Erreur serveur lors de la transcription');
                } else {
                    throw new Error(`Erreur ${response.status}: ${errorText}`);
                }
            }

            const result = await response.json();
            console.log('Transcription result:', result);

            if (result.success && result.text && result.text.trim()) {
                if (result.text.trim().length < 3) {
                    setVoiceState(prev => ({
                        ...prev,
                        error: 'Enregistrement trop court. Parlez plus longtemps et plus clairement.',
                    }));
                } else {
                    onTranscriptionComplete(result.text.trim());
                }
            } else {
                setVoiceState(prev => ({
                    ...prev,
                    error: 'Aucune parole claire détectée. Essayez de parler plus fort, plus clairement et plus longtemps.',
                }));
            }
        } catch (error) {
            console.error('Error transcribing audio:', error);

            let errorMessage = 'Erreur lors de la transcription audio';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            setVoiceState(prev => ({
                ...prev,
                error: errorMessage,
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
                    ${
                        voiceState.isRecording
                            ? 'bg-red-500/20 border-red-400/60 text-red-400 hover:bg-red-500/30'
                            : voiceState.isProcessing
                              ? 'bg-yellow-500/20 border-yellow-400/60 text-yellow-400'
                              : 'bg-purple-500/20 border-purple-400/60 text-purple-400 hover:bg-purple-500/30'
                    }
                    border-2 hover:scale-105 shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    focus:outline-none focus:ring-2 focus:ring-purple-400/50
                `}
                title={
                    voiceState.isRecording
                        ? 'Arrêter l&apos;enregistrement (min. 1,5s)'
                        : voiceState.isProcessing
                          ? 'Transcription en cours...'
                          : 'Enregistrer avec la voix (parlez clairement)'
                }
            >
                {voiceState.isProcessing ? (
                    <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : voiceState.isRecording ? (
                    <>
                        <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M6 2a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v6H6V4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </>
                ) : (
                    <svg
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
                <span className="text-sm">
                    {voiceState.isRecording
                        ? 'Stop'
                        : voiceState.isProcessing
                          ? 'Transcription...'
                          : 'Voix'}
                </span>

                {voiceState.isRecording && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                )}
            </button>

            {/* Recording instructions */}
            {!voiceState.error && (
                <p className="text-xs text-gray-400 mt-2">
                    {voiceState.isRecording
                        ? '🎤 Parlez maintenant... (min. 1,5s)'
                        : voiceState.isProcessing
                          ? '⏳ Transcription en cours...'
                          : '💡 Cliquez et parlez clairement pendant au moins 1,5 seconde'}
                </p>
            )}

            {/* Error Display */}
            {voiceState.error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <h4 className="text-red-400 font-medium text-sm">
                                Erreur d&apos;enregistrement
                            </h4>
                            <p className="text-red-300 text-sm mt-1">
                                {voiceState.error}
                            </p>
                            <button
                                onClick={() =>
                                    setVoiceState(prev => ({
                                        ...prev,
                                        error: null,
                                    }))
                                }
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
