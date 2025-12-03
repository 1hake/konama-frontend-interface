'use client';

import { WorkflowPromptForm, LiveImageGenerator, WebSocketStatus, ImageNotification } from '@/components';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function Home() {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative">
        {/* Background avec images générées en temps réel */}
        <div className="fixed inset-0 overflow-auto z-0">
          <div className="p-6 pt-20">
            <LiveImageGenerator 
              className="opacity-90"
              showConnectionStatus={false}
              maxImages={12}
            />
          </div>
        </div>

        {/* Statut WebSocket - Position fixe en haut à droite */}
        <div className="fixed top-4 right-4 z-40">
          <WebSocketStatus showDetails={false} />
        </div>

        {/* Fixed Floating Prompt Builder - Bottom Dock Style */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
            <WorkflowPromptForm />
        </div>

        {/* Notifications pour les nouvelles images */}
        <ImageNotification position="top-right" duration={7000} maxNotifications={3} />
      </div>
    </AuthenticatedLayout>
  );
}
