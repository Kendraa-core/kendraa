import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useOnboardingProtection() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // If no user, redirect to signin
    if (!user) {
      router.push('/signin');
      return;
    }

    // If user exists but no profile, wait for profile to load
    if (!profile) return;

    // If onboarding is not completed, redirect to onboarding
    if (!profile.onboarding_completed) {
      console.log('[OnboardingProtection] User has not completed onboarding, redirecting to /onboarding');
      router.push('/onboarding');
      return;
    }
  }, [user, profile, loading, router]);

  // Return whether the user should be allowed to access protected routes
  const isOnboardingComplete = profile?.onboarding_completed === true;
  const isProtected = !loading && user && profile && isOnboardingComplete;

  return {
    isProtected,
    isOnboardingComplete,
    isLoading: loading,
    user,
    profile
  };
}
