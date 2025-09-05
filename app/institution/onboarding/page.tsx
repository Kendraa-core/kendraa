'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import InstitutionOnboardingModal from '@/components/profile/InstitutionOnboardingModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function InstitutionOnboardingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkInstitutionProfile = async () => {
      if (!user?.id) {
        router.push('/signin');
        return;
      }

      try {
        setLoading(true);
        
        // Check if user already has an institution profile
        // For now, we'll redirect to feed if they have a profile
        // In the future, you can add logic to check for institution profiles
        
        // If no institution profile exists, show onboarding
        setShowOnboarding(true);
      } catch (error) {
        // Silent error handling for institution profile check
        router.push('/feed');
      } finally {
        setLoading(false);
      }
    };

    checkInstitutionProfile();
  }, [user?.id, router]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.push('/feed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading institution setup...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstitutionOnboardingModal
        isOpen={showOnboarding}
        onClose={() => router.push('/feed')}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
