'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Profile } from '@/types/database.types';

export default function UserSearch({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [recentSearches, setRecentSearches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

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
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

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

  const renderProfile = (profile: Profile) => (
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
        <UserCircleIcon className="w-10 h-10 text-gray-400" />
      )}
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900">{profile.full_name}</div>
        {profile.headline && (
          <div className="text-sm text-gray-500 truncate">{profile.headline}</div>
        )}
        {profile.location && (
          <div className="text-xs text-gray-400">{profile.location}</div>
        )}
      </div>
    </button>
  );

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
            Try searching for people by name, headline, or location
          </div>
        )}
      </div>
    </div>
  );
} 