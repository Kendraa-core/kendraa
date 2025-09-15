'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MobileHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user type
        if (user.user_metadata?.user_type === 'institution' || user.user_metadata?.profile_type === 'institution') {
          router.replace('/mob/institution/feed');
        } else {
          router.replace('/mob/feed');
        }
      } else {
        // Redirect to sign in
        router.replace('/signin');
      }
    }
  }, [user, loading, router]);

  return <LoadingSpinner variant="fullscreen" text="Redirecting..." />;
}
