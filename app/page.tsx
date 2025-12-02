'use client';

import { WorkflowPromptForm } from '@/components';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function Home() {
  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-12">
        <div className="container mx-auto px-4">
      
          <WorkflowPromptForm />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
