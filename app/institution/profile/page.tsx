'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function InstitutionProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user?.id) {
        // Redirect to the public profile page with the user's ID
        router.replace(`/institution/profile/${user.id}`);
      } else {
        // If no user is logged in, redirect to sign in
        router.replace('/signin');
      }
    }
  }, [user?.id, authLoading, router]);

  // Show loading while redirecting
    return (
      <LoadingSpinner 
        variant="fullscreen" 
      text="Redirecting to institution profile..." 
    />
  );
}
