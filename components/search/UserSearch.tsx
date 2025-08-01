'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { UserCircleIcon, XMarkIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import { BuildingOfficeIcon as BuildingOfficeSolidIcon, UserIcon as UserSolidIcon } from '@heroicons/react/24/solid';
import type { Profile } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';
import { followUser, unfollowUser, isFollowing } from '@/lib/queries';
import toast from 'react-hot-toast';

export default function UserSearch({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [recentSearches, setRecentSearches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchTermLower = searchTerm.toLowerCase().trim();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${searchTermLower}%,headline.ilike.%${searchTermLower}%,location.ilike.%${searchTermLower}%`)
          .not('full_name', 'is', null)
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);

        // Check following status for each result
        if (user && data) {
          const followingChecks = await Promise.all(
            data.map(async (profile) => {
              const isFollowingUser = await isFollowing(user.id, profile.id);
              return { id: profile.id, following: isFollowingUser };
            })
          );
          
          const followingMap = followingChecks.reduce((acc, { id, following }) => {
            acc[id] = following;
            return acc;
          }, {} as Record<string, boolean>);
          
          setFollowingStates(followingMap);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, user]);

  const handleUserClick = (profile: Profile) => {
    // Add to recent searches
    const updatedSearches = [
      profile,
      ...recentSearches.filter(s => s.id !== profile.id)
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    // Navigate to profile
    router.push(`/profile/${profile.id}`);
    if (onClose) onClose();
  };

  const handleFollowToggle = async (profile: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const isCurrentlyFollowing = followingStates[profile.id];
      
      if (isCurrentlyFollowing) {
        // Unfollow
        const success = await unfollowUser(user.id, profile.id);
        if (success) {
          setFollowingStates(prev => ({ ...prev, [profile.id]: false }));
          toast.success(`Unfollowed ${profile.full_name}`);
        }
      } else {
        // Follow (no approval needed for institutions)
        const success = await followUser(
          user.id, 
          profile.id, 
          user.user_metadata?.profile_type || 'individual',
          profile.profile_type
        );
        if (success) {
          setFollowingStates(prev => ({ ...prev, [profile.id]: true }));
          toast.success(`Following ${profile.full_name}`);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const renderProfile = (profile: Profile) => {
    const isCurrentlyFollowing = followingStates[profile.id];
    const isInstitution = profile.profile_type === 'institution';
    const IconComponent = isInstitution ? BuildingOfficeIcon : UserIcon;
    const SolidIconComponent = isInstitution ? BuildingOfficeSolidIcon : UserSolidIcon;

    return (
      <button
        key={profile.id}
        onClick={() => handleUserClick(profile)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name || ''}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <IconComponent className="w-10 h-10 text-gray-400" />
        )}
        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {profile.full_name}
            {isInstitution && <SolidIconComponent className="w-4 h-4 text-blue-600" />}
          </div>
          {profile.headline && (
            <div className="text-sm text-gray-500 truncate">{profile.headline}</div>
          )}
          {profile.location && (
            <div className="text-xs text-gray-400">{profile.location}</div>
          )}
        </div>
        {user && user.id !== profile.id && (
          <button
            onClick={(e) => handleFollowToggle(profile, e)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isCurrentlyFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCurrentlyFollowing ? 'Following' : isInstitution ? 'Follow' : 'Connect'}
          </button>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, headline, or location"
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : searchTerm ? (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
              Search Results
            </div>
            <div className="divide-y divide-gray-100">
              {searchResults.length > 0 ? (
                searchResults.map(profile => renderProfile(profile))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        ) : recentSearches.length > 0 ? (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
              Recent Searches
            </div>
            <div className="divide-y divide-gray-100">
              {recentSearches.map(profile => renderProfile(profile))}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Try searching for people or institutions by name, headline, or location
          </div>
        )}
      </div>
    </div>
  );
} 