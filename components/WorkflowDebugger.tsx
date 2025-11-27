'use client';

import { useState } from 'react';
import { config } from '../lib/config';

export const WorkflowDebugger = () => {
    const [response, setResponse] = useState<Record<string, unknown> | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testFetch = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.workflowApiUrl}/workflows`);
            const data = await response.json();
            setResponse(data);
            console.log('Raw response from workflow service:', data);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch';
            setError(errorMessage);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-lg">
            <h3 className="text-lg font-bold mb-4">Workflow Debug Tool</h3>

            <button
                onClick={testFetch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
            >
                {loading ? 'Loading...' : 'Test Fetch Workflows'}
            </button>

            {error && (
                <div className="bg-red-900 p-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {response && (
                <div className="bg-gray-800 p-3 rounded">
                    <h4 className="font-bold mb-2">Raw Response:</h4>
                    <pre className="text-xs overflow-auto max-h-96">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
