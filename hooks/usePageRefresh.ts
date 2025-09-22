import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function usePageRefresh() {
  const router = useRouter();

  const refreshPage = useCallback(() => {
    // Use router.refresh() for Next.js 13+ app directory
    router.refresh();
  }, [router]);

  // Listen for custom events that should trigger page refresh
  useEffect(() => {
    const handlePostCreated = () => {
      console.log('Post created event received, refreshing page...');
      refreshPage();
    };

    const handleFollowStatusUpdated = () => {
      console.log('Follow status updated event received, refreshing page...');
      refreshPage();
    };

    const handleConnectionRequestSent = () => {
      console.log('Connection request sent event received, refreshing page...');
      refreshPage();
    };

    const handleConnectionAccepted = () => {
      console.log('Connection accepted event received, refreshing page...');
      refreshPage();
    };

    const handleConnectionRejected = () => {
      console.log('Connection rejected event received, refreshing page...');
      refreshPage();
    };

    // Add event listeners
    window.addEventListener('post-created', handlePostCreated);
    window.addEventListener('follow-status-updated', handleFollowStatusUpdated);
    window.addEventListener('connection-request-sent', handleConnectionRequestSent);
    window.addEventListener('connection-accepted', handleConnectionAccepted);
    window.addEventListener('connection-rejected', handleConnectionRejected);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('post-created', handlePostCreated);
      window.removeEventListener('follow-status-updated', handleFollowStatusUpdated);
      window.removeEventListener('connection-request-sent', handleConnectionRequestSent);
      window.removeEventListener('connection-accepted', handleConnectionAccepted);
      window.removeEventListener('connection-rejected', handleConnectionRejected);
    };
  }, [refreshPage]);

  return { refreshPage };
}
