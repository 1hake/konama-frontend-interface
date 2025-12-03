'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function WebSocketTester() {
    const { session } = useAuth();
    const [testResult, setTestResult] = useState<string>('');
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [isTestingAPI, setIsTestingAPI] = useState(false);

    // Test de connexion WebSocket simple
    const testWebSocketConnection = async () => {
        if (!session?.token) {
            setTestResult('❌ Aucun token d\'authentification disponible');
            return;
        }

        setIsTestingConnection(true);
        setTestResult('🔄 Test de connexion WebSocket en cours...\n');

        try {
            const wsUrl = `wss://client.konama.fuzdi.fr/ws?token=${encodeURIComponent(session.token)}`;
            
            // Test de connexion avec timeout
            const ws = new WebSocket(wsUrl);
            let connected = false;
            
            // Timeout après 10 secondes
            const timeout = setTimeout(() => {
                if (!connected) {
                    ws.close();
                    setTestResult(prev => prev + '⏰ Timeout: Aucune réponse du serveur après 10s\n');
                    setIsTestingConnection(false);
                }
            }, 10000);

            ws.onopen = () => {
                connected = true;
                clearTimeout(timeout);
                setTestResult(prev => prev + '✅ Connexion WebSocket réussie!\n');
                setTestResult(prev => prev + '📡 Attente d\'événements...\n');
                
                // Fermer après 5 secondes pour le test
                setTimeout(() => {
                    ws.close();
                    setTestResult(prev => prev + '🔌 Connexion fermée (test terminé)\n');
                    setIsTestingConnection(false);
                }, 5000);
            };

            ws.onerror = (error) => {
                clearTimeout(timeout);
                setTestResult(prev => prev + '❌ Erreur WebSocket: ' + error + '\n');
                setIsTestingConnection(false);
            };

            ws.onclose = (event) => {
                clearTimeout(timeout);
                if (!connected) {
                    setTestResult(prev => prev + `❌ Connexion fermée immédiatement - Code: ${event.code}, Raison: ${event.reason}\n`);
                    if (event.code === 1008) {
                        setTestResult(prev => prev + '🔐 Code 1008: Problème d\'authentification probable\n');
                    }
                }
                setIsTestingConnection(false);
            };

            ws.onmessage = (event) => {
                setTestResult(prev => prev + '📨 Message reçu: ' + event.data + '\n');
            };

        } catch (error) {
            setTestResult(prev => prev + '💥 Erreur lors de l\'initialisation: ' + error + '\n');
            setIsTestingConnection(false);
        }
    };

    // Test de l'API REST
    const testAPIConnection = async () => {
        if (!session?.token) {
            setTestResult('❌ Aucun token d\'authentification disponible');
            return;
        }

        setIsTestingAPI(true);
        setTestResult('🔄 Test de l\'API REST en cours...\n');

        try {
            // Test avec un taskId fictif pour voir la structure de la réponse
            const testTaskId = 'test-task-id';
            const response = await fetch(`https://client.konama.fuzdi.fr/tasks/${testTaskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json',
                },
            });

            setTestResult(prev => prev + `📡 Statut de réponse: ${response.status} ${response.statusText}\n`);

            if (response.ok) {
                const data = await response.json();
                setTestResult(prev => prev + '✅ Réponse API reçue:\n');
                setTestResult(prev => prev + JSON.stringify(data, null, 2) + '\n');
            } else {
                const errorText = await response.text();
                setTestResult(prev => prev + '⚠️ Réponse d\'erreur:\n');
                setTestResult(prev => prev + errorText + '\n');
            }
        } catch (error) {
            setTestResult(prev => prev + '❌ Erreur API: ' + error + '\n');
        } finally {
            setIsTestingAPI(false);
        }
    };

    const clearResults = () => {
        setTestResult('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                🧪 Test manuel de connexion
            </h3>

            <div className="space-y-4">
                <div className="flex space-x-3">
                    <button
                        onClick={testWebSocketConnection}
                        disabled={isTestingConnection || !session?.token}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
                    >
                        {isTestingConnection ? '🔄 Test WebSocket...' : '🔌 Tester WebSocket'}
                    </button>

                    <button
                        onClick={testAPIConnection}
                        disabled={isTestingAPI || !session?.token}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-colors"
                    >
                        {isTestingAPI ? '🔄 Test API...' : '📡 Tester API REST'}
                    </button>

                    <button
                        onClick={clearResults}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                        🗑️ Vider
                    </button>
                </div>

                {testResult && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {testResult}
                    </div>
                )}

                {!session?.token && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <div className="text-yellow-700 text-sm">
                            ⚠️ Vous devez être authentifié pour effectuer les tests
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}