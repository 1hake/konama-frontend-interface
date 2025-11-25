/**
 * Funnels List Page
 * 
 * Displays all funnels and allows creating new ones
 */

'use client';

import { useState, useEffect } from 'react';
import { Funnel, FunnelConfig } from '@/types/funnel';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useFunnel } from '@/hooks/useFunnel';
import { FunnelCreationModal } from '@/components/Funnel/FunnelCreationModal';
import Link from 'next/link';

export default function FunnelsPage() {
  const { workflows } = useWorkflows();
  const { createFunnel } = useFunnel();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load funnels
  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    try {
      const response = await fetch('/api/funnel/list');
      const data = await response.json();
      setFunnels(data.funnels || []);
    } catch (error) {
      console.error('Error loading funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFunnel = async (
    config: FunnelConfig,
    name: string,
    description?: string
  ) => {
    await createFunnel(config, name, description);
    await loadFunnels();
    // The modal will close automatically after creation
    // Navigate to the new funnel (we'll need to get the ID from createFunnel)
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'completed':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-white/40 bg-white/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Studio
            </Link>
            <h1 className="text-4xl font-light text-white">Funnels</h1>
            <p className="text-white/60 mt-2">
              Multi-stage iterative image generation pipelines
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Funnel
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 mx-auto text-purple-500"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-white/60 mt-4">Loading funnels...</p>
            </div>
          </div>
        ) : funnels.length === 0 ? (
          <div className="glass rounded-3xl border border-white/10 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-white mb-3">
                No Funnels Yet
              </h3>
              <p className="text-white/60 mb-6">
                Create your first funnel to start generating images across multiple workflows and refine them iteratively.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Funnel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funnels.map((funnel) => (
              <Link
                key={funnel.id}
                href={`/funnels/${funnel.id}`}
                className="glass rounded-2xl border border-white/10 p-6 hover:bg-white/5 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate mb-1">
                      {funnel.name}
                    </h3>
                    {funnel.description && (
                      <p className="text-sm text-white/60 line-clamp-2">
                        {funnel.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                      funnel.status
                    )}`}
                  >
                    {funnel.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="glass-light rounded-lg p-3">
                    <div className="text-2xl font-light text-white">
                      {funnel.steps.length}
                    </div>
                    <div className="text-xs text-white/60">Steps</div>
                  </div>
                  <div className="glass-light rounded-lg p-3">
                    <div className="text-2xl font-light text-white">
                      {funnel.config.selectedWorkflows.length}
                    </div>
                    <div className="text-xs text-white/60">Workflows</div>
                  </div>
                  <div className="glass-light rounded-lg p-3">
                    <div className="text-2xl font-light text-purple-400">
                      {funnel.currentStepIndex + 1}
                    </div>
                    <div className="text-xs text-white/60">Current</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs text-white/40">
                    Updated {formatDate(funnel.updatedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <FunnelCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateFunnel}
        workflows={workflows.map(w => ({ id: w.id, name: w.id }))}
      />
    </div>
  );
}
