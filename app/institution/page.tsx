'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstitutionHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to institution feed
    router.replace('/institution/feed');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
        <p className="text-sm text-[#007fff]">Redirecting to institution feed...</p>
      </div>
    </div>
  );
}
