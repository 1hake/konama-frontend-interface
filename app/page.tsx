'use client';

import { WorkflowPromptForm } from '@/components';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { GeneratedImagesDisplay } from '@/components';

export default function Home() {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative">
        {/* Background Placeholder - Always Visible */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-full h-screen">
            <GeneratedImagesDisplay 
              images={[]} 
              getImageUrl={() => ''}
            />
          </div>
        </div>

        {/* Fixed Floating Prompt Builder - Bottom Dock Style */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
            <WorkflowPromptForm />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
