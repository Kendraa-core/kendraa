'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFollowStatus, getConnectionStatus } from '@/lib/queries';

interface FollowState {
  [userId: string]: {
    followStatus: 'none' | 'following' | 'not_following';
    connectionStatus: 'none' | 'pending' | 'connected';
    lastUpdated: number;
  };
}

interface FollowContextType {
  getFollowStatus: (targetUserId: string) => 'none' | 'following' | 'not_following';
  getConnectionStatus: (targetUserId: string) => 'none' | 'pending' | 'connected';
  updateFollowStatus: (targetUserId: string, status: 'none' | 'following' | 'not_following') => void;
  updateConnectionStatus: (targetUserId: string, status: 'none' | 'pending' | 'connected') => void;
  refreshUserStatus: (targetUserId: string) => Promise<void>;
  clearAllStatuses: () => void;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [followStates, setFollowStates] = useState<FollowState>({});

  // Get follow status with caching
  const getFollowStatusCached = useCallback((targetUserId: string): 'none' | 'following' | 'not_following' => {
    if (!user?.id || !targetUserId) return 'none';
    
    const state = followStates[targetUserId];
    if (state && Date.now() - state.lastUpdated < 30000) { // 30 second cache
      return state.followStatus;
    }
    
    return 'none';
  }, [followStates, user?.id]);

  // Get connection status with caching
  const getConnectionStatusCached = useCallback((targetUserId: string): 'none' | 'pending' | 'connected' => {
    if (!user?.id || !targetUserId) return 'none';
    
    const state = followStates[targetUserId];
    if (state && Date.now() - state.lastUpdated < 30000) { // 30 second cache
      return state.connectionStatus;
    }
    
    return 'none';
  }, [followStates, user?.id]);

  // Update follow status
  const updateFollowStatus = useCallback((targetUserId: string, status: 'none' | 'following' | 'not_following') => {
    if (!user?.id || !targetUserId) return;
    
    setFollowStates(prev => ({
      ...prev,
      [targetUserId]: {
        ...prev[targetUserId],
        followStatus: status,
        lastUpdated: Date.now()
      }
    }));

    // Dispatch global event for other components
    window.dispatchEvent(new CustomEvent('follow-status-changed', {
      detail: { targetUserId, followStatus: status }
    }));
  }, [user?.id]);

  // Update connection status
  const updateConnectionStatus = useCallback((targetUserId: string, status: 'none' | 'pending' | 'connected') => {
    if (!user?.id || !targetUserId) return;
    
    setFollowStates(prev => ({
      ...prev,
      [targetUserId]: {
        ...prev[targetUserId],
        connectionStatus: status,
        lastUpdated: Date.now()
      }
    }));

    // Dispatch global event for other components
    window.dispatchEvent(new CustomEvent('connection-status-changed', {
      detail: { targetUserId, connectionStatus: status }
    }));
  }, [user?.id]);

  // Refresh user status from database
  const refreshUserStatus = useCallback(async (targetUserId: string) => {
    if (!user?.id || !targetUserId) return;
    
    try {
      const [followStatus, connectionStatus] = await Promise.all([
        getFollowStatus(user.id, targetUserId),
        getConnectionStatus(user.id, targetUserId)
      ]);

      setFollowStates(prev => ({
        ...prev,
        [targetUserId]: {
          followStatus: followStatus ? 'following' : 'not_following',
          connectionStatus: connectionStatus as 'none' | 'pending' | 'connected',
          lastUpdated: Date.now()
        }
      }));
    } catch (error) {
      console.error('Error refreshing user status:', error);
    }
  }, [user?.id]);

  // Clear all cached statuses
  const clearAllStatuses = useCallback(() => {
    setFollowStates({});
  }, []);

  // Listen for global status change events
  useEffect(() => {
    const handleFollowStatusChanged = (event: CustomEvent) => {
      const { targetUserId, followStatus } = event.detail;
      updateFollowStatus(targetUserId, followStatus);
    };

    const handleConnectionStatusChanged = (event: CustomEvent) => {
      const { targetUserId, connectionStatus } = event.detail;
      updateConnectionStatus(targetUserId, connectionStatus);
    };

    window.addEventListener('follow-status-changed', handleFollowStatusChanged as EventListener);
    window.addEventListener('connection-status-changed', handleConnectionStatusChanged as EventListener);

    return () => {
      window.removeEventListener('follow-status-changed', handleFollowStatusChanged as EventListener);
      window.removeEventListener('connection-status-changed', handleConnectionStatusChanged as EventListener);
    };
  }, [updateFollowStatus, updateConnectionStatus]);

  const value: FollowContextType = {
    getFollowStatus: getFollowStatusCached,
    getConnectionStatus: getConnectionStatusCached,
    updateFollowStatus,
    updateConnectionStatus,
    refreshUserStatus,
    clearAllStatuses
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollowContext() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollowContext must be used within a FollowProvider');
  }
  return context;
}
