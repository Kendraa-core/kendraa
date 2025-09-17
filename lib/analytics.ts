// Analytics utility functions

export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getLocation(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return window.location.pathname;
  } catch {
    return null;
  }
}

export function trackPostInteraction(
  postId: string,
  userId: string | null,
  action: 'impression' | 'view' | 'share',
  additionalData?: {
    source?: 'feed' | 'profile' | 'search' | 'direct' | 'share';
    viewDuration?: number;
    shareType?: 'native' | 'copy_link' | 'external';
    platform?: string;
    recipientCount?: number;
  }
): void {
  // This function will be called from components to track interactions
  // The actual tracking will be handled by the specific tracking functions
  console.log('Tracking post interaction:', { postId, userId, action, additionalData });
}

// Hook for tracking post impressions
export function usePostTracking(postId: string, userId: string | null = null) {
  const trackImpression = (source: 'feed' | 'profile' | 'search' | 'direct' | 'share' = 'feed') => {
    // This will be implemented in the component
  };

  const trackView = (viewDuration: number = 0) => {
    // This will be implemented in the component
  };

  const trackShare = (
    shareType: 'native' | 'copy_link' | 'external' = 'native',
    platform?: string,
    recipientCount?: number
  ) => {
    // This will be implemented in the component
  };

  return {
    trackImpression,
    trackView,
    trackShare
  };
}
