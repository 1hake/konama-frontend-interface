import { useWorkflows } from '../hooks/useWorkflows';
import { config } from '../lib/config';

export const WorkflowDiagnostic = () => {
    const { workflows, loading, error } = useWorkflows();

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 text-sm max-w-sm z-50">
            <h3 className="font-bold text-white mb-2">🔧 Workflow Diagnostic</h3>
            <div className="space-y-1 text-gray-300">
                <p>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'Yes' : 'No'}</span></p>
                <p>Count: <span className="text-blue-400">{workflows.length}</span></p>
                <p>Error: <span className={error ? 'text-red-400' : 'text-green-400'}>{error || 'None'}</span></p>
                <p>Mock Mode: <span className={config.mockWorkflows ? 'text-yellow-400' : 'text-green-400'}>{config.mockWorkflows ? 'Yes' : 'No'}</span></p>
                <p>API URL: <span className="text-gray-400 text-xs">{config.workflowApiUrl}</span></p>
                {workflows.length > 0 && (
                    <div>
                        <p className="font-semibold text-white">Workflows:</p>
                        {workflows.slice(0, 3).map(w => (
                            <p key={w.id} className="text-xs text-gray-400">• {w.name} ({w.source})</p>
                        ))}
                        {workflows.length > 3 && <p className="text-xs text-gray-500">+ {workflows.length - 3} more...</p>}
                    </div>
                )}
            </div>
        </div>
    );
};