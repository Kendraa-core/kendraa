import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowContext } from '@/contexts/FollowContext';
import { 
  getConnectionStatus, 
  sendConnectionRequest, 
  followUser, 
  unfollowUser, 
  isFollowing,
  followInstitution,
  unfollowInstitution,
  getFollowStatus
} from '@/lib/queries';
import toast from 'react-hot-toast';

export type FollowStatus = 'none' | 'following' | 'pending' | 'connected';

interface UseFollowStatusProps {
  targetUserId: string;
  targetUserType: 'individual' | 'institution';
  currentUserType: 'individual' | 'institution';
}

export function useFollowStatus({ 
  targetUserId, 
  targetUserType, 
  currentUserType 
}: UseFollowStatusProps) {
  const { user } = useAuth();
  const { 
    getFollowStatus: getCachedFollowStatus, 
    getConnectionStatus: getCachedConnectionStatus,
    updateFollowStatus,
    updateConnectionStatus,
    refreshUserStatus
  } = useFollowContext();
  const [status, setStatus] = useState<FollowStatus>('none');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Determine the action type based on user types
  const actionType = currentUserType === 'institution' || targetUserType === 'institution' ? 'follow' : 'connect';
  const canSendRequests = currentUserType === 'individual';

  // Fetch current status
  const fetchStatus = useCallback(async () => {
    if (!user?.id || !targetUserId) return;

    setLoading(true);
    try {
      if (actionType === 'follow') {
        // For follow relationships (institution to institution or individual to institution)
        const cachedFollowStatus = getCachedFollowStatus(targetUserId);
        if (cachedFollowStatus !== 'none') {
          setStatus(cachedFollowStatus === 'following' ? 'following' : 'none');
        } else {
          const isUserFollowing = await isFollowing(user.id, targetUserId);
          const followStatus = isUserFollowing ? 'following' : 'not_following';
          updateFollowStatus(targetUserId, followStatus);
          setStatus(isUserFollowing ? 'following' : 'none');
        }
      } else {
        // For connection relationships (individual to individual)
        const cachedConnectionStatus = getCachedConnectionStatus(targetUserId);
        if (cachedConnectionStatus !== 'none') {
          setStatus(cachedConnectionStatus as FollowStatus);
        } else {
          const connectionStatus = await getConnectionStatus(user.id, targetUserId);
          updateConnectionStatus(targetUserId, connectionStatus as 'none' | 'pending' | 'connected');
          setStatus(connectionStatus as FollowStatus);
        }
      }
    } catch (error) {
      console.error('Error fetching follow/connection status:', error);
      setStatus('none');
    } finally {
      setLoading(false);
    }
  }, [user?.id, targetUserId, actionType, getCachedFollowStatus, getCachedConnectionStatus, updateFollowStatus, updateConnectionStatus]);

  // Handle follow/connect action
  const handleAction = useCallback(async () => {
    if (!user?.id || !targetUserId || actionLoading) return;

    if (!canSendRequests) {
      toast.error('Institutions cannot send connection or follow requests');
      return;
    }

    setActionLoading(true);
    const previousStatus = status;

    try {
      if (actionType === 'follow') {
        if (status === 'following') {
          // Unfollow
          const success = targetUserType === 'institution' 
            ? await unfollowInstitution(user.id, targetUserId)
            : await unfollowUser(user.id, targetUserId);
          
          if (success) {
            setStatus('none');
            updateFollowStatus(targetUserId, 'not_following');
            toast.success('Unfollowed successfully');
          } else {
            setStatus(previousStatus);
            toast.error('Failed to unfollow');
          }
        } else {
          // Follow
          const success = targetUserType === 'institution'
            ? await followInstitution(user.id, targetUserId)
            : await followUser(user.id, targetUserId, currentUserType, targetUserType);
          
          if (success) {
            setStatus('following');
            updateFollowStatus(targetUserId, 'following');
            toast.success('Following successfully');
          } else {
            setStatus(previousStatus);
            toast.error('Failed to follow');
          }
        }
      } else {
        // Connection request
        if (status === 'connected') {
          toast.info('Already connected');
          return;
        } else if (status === 'pending') {
          toast.info('Connection request already pending');
          return;
        } else {
          const result = await sendConnectionRequest(user.id, targetUserId);
          if (result) {
            setStatus('pending');
            updateConnectionStatus(targetUserId, 'pending');
            toast.success('Connection request sent');
          } else {
            setStatus(previousStatus);
            toast.error('Failed to send connection request');
          }
        }
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('follow-status-updated', {
        detail: { 
          targetUserId, 
          targetUserType, 
          newStatus: status,
          action: actionType
        }
      }));
      
      // Also dispatch connection-request-sent event for connection requests
      if (actionType === 'connect' && status === 'pending') {
        window.dispatchEvent(new CustomEvent('connection-request-sent', {
          detail: { 
            targetUserId, 
            targetUserType
          }
        }));
      }

    } catch (error: any) {
      console.error('Error in follow/connect action:', error);
      setStatus(previousStatus);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  }, [user?.id, targetUserId, status, actionType, targetUserType, currentUserType, canSendRequests, actionLoading]);

  // Get button text and styling based on status
  const getButtonProps = useCallback(() => {
    const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-lg transition-all duration-200 text-sm font-semibold w-full group hover:scale-[1.02]";
    
    if (actionType === 'follow') {
      if (status === 'following') {
        return {
          text: 'Following',
          className: `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200`,
          icon: 'CheckIcon',
          disabled: actionLoading
        };
      } else {
        return {
          text: 'Follow',
          className: `${baseClasses} bg-[#007fff] text-white hover:bg-[#007fff]/90 shadow-lg hover:shadow-xl`,
          icon: 'PlusIcon',
          disabled: actionLoading || !canSendRequests
        };
      }
    } else {
      if (status === 'connected') {
        return {
          text: 'Connected',
          className: `${baseClasses} bg-green-100 text-green-700 border border-green-200`,
          icon: 'CheckIcon',
          disabled: true
        };
      } else if (status === 'pending') {
        return {
          text: 'Pending',
          className: `${baseClasses} bg-yellow-100 text-yellow-700 border border-yellow-200`,
          icon: 'ClockIcon',
          disabled: true
        };
      } else {
        return {
          text: 'Connect',
          className: `${baseClasses} bg-[#007fff] text-white hover:bg-[#007fff]/90 shadow-lg hover:shadow-xl`,
          icon: 'UserPlusIcon',
          disabled: actionLoading || !canSendRequests
        };
      }
    }
  }, [status, actionType, actionLoading, canSendRequests]);

  // Listen for status updates from other components
  useEffect(() => {
    const handleStatusUpdate = (event: CustomEvent) => {
      const { targetUserId: eventTargetId, newStatus } = event.detail;
      if (eventTargetId === targetUserId) {
        setStatus(newStatus);
      }
    };

    const handleFollowStatusChanged = (event: CustomEvent) => {
      const { targetUserId: eventTargetId, followStatus } = event.detail;
      if (eventTargetId === targetUserId && actionType === 'follow') {
        setStatus(followStatus === 'following' ? 'following' : 'none');
      }
    };

    const handleConnectionStatusChanged = (event: CustomEvent) => {
      const { targetUserId: eventTargetId, connectionStatus } = event.detail;
      if (eventTargetId === targetUserId && actionType === 'connect') {
        setStatus(connectionStatus as FollowStatus);
      }
    };

    window.addEventListener('follow-status-updated', handleStatusUpdate as EventListener);
    window.addEventListener('follow-status-changed', handleFollowStatusChanged as EventListener);
    window.addEventListener('connection-status-changed', handleConnectionStatusChanged as EventListener);
    
    return () => {
      window.removeEventListener('follow-status-updated', handleStatusUpdate as EventListener);
      window.removeEventListener('follow-status-changed', handleFollowStatusChanged as EventListener);
      window.removeEventListener('connection-status-changed', handleConnectionStatusChanged as EventListener);
    };
  }, [targetUserId, actionType]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    actionLoading,
    actionType,
    canSendRequests,
    handleAction,
    getButtonProps,
    fetchStatus
  };
}
