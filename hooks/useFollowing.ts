import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFollowing, followInstitution, unfollowInstitution, followUser, unfollowUser } from '@/lib/queries';
import { Profile } from '@/types/database.types';
import { toast } from 'react-hot-toast';

interface FollowingProfile extends Profile {
  follow_status: 'following' | 'not_following';
}

export function useFollowing() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<FollowingProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowing = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const followingData = await getFollowing(user.id);
      
      // Extract profiles from the follow relationships
      const followingProfiles = followingData.map(follow => ({
        ...follow.following,
        follow_status: 'following' as const
      }));

      setFollowing(followingProfiles);
    } catch (error) {
      console.error('Error fetching following data:', error);
      toast.error('Failed to load following data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const followProfile = useCallback(async (profileId: string, profileType: 'individual' | 'institution') => {
    if (!user?.id) return false;
    
    try {
      let success = false;
      
      if (profileType === 'institution') {
        success = await followInstitution(user.id, profileId);
      } else {
        // For individual users, we need to determine the follower and following types
        const followerType = 'individual'; // Assuming the current user is individual
        const followingType = 'individual';
        const result = await followUser(user.id, profileId, followerType, followingType);
        success = !!result;
      }
      
      if (success) {
        // Refresh the following list
        await fetchFollowing();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error following profile:', error);
      return false;
    }
  }, [user?.id, fetchFollowing]);

  const unfollowProfile = useCallback(async (profileId: string, profileType: 'individual' | 'institution') => {
    if (!user?.id) return false;
    
    try {
      let success = false;
      
      if (profileType === 'institution') {
        success = await unfollowInstitution(user.id, profileId);
      } else {
        success = await unfollowUser(user.id, profileId);
      }
      
      if (success) {
        // Remove from local state immediately for better UX
        setFollowing(prev => prev.filter(p => p.id !== profileId));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unfollowing profile:', error);
      return false;
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  // Refresh when page comes into focus or when following actions occur
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchFollowing();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFollowing();
      }
    };

    const handleFollowingUpdate = (event: CustomEvent) => {
      // Refresh the following list when follow/unfollow actions occur
      fetchFollowing();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('following-updated', handleFollowingUpdate as EventListener);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('following-updated', handleFollowingUpdate as EventListener);
    };
  }, [fetchFollowing]);

  return {
    following,
    loading,
    fetchFollowing,
    followProfile,
    unfollowProfile,
  };
}
