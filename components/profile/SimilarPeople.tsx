'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { getSuggestedConnections } from '@/lib/queries';
import type { Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

export default function SimilarPeople() {
  const { user } = useAuth();
  const [similarPeople, setSimilarPeople] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSimilarPeople = async () => {
      if (!user?.id) return;

      try {
        const connections = await getSuggestedConnections(user.id, 5);
        setSimilarPeople(connections);
          } catch (error) {
      // Silent error handling for similar people
    } finally {
        setLoading(false);
      }
    };

    loadSimilarPeople();
  }, [user?.id]);

  const handleConnect = async (profileId: string) => {
    // TODO: Implement connection request
    toast.success('Connection request sent!');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (similarPeople.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No suggestions available</p>
        <p className="text-xs mt-1">Complete your profile to get better recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {similarPeople.map((person) => (
        <div key={person.id} className="flex items-center space-x-3">
          <Link href={`/profile/${person.id}`} className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar
              src={person.avatar_url}
              alt={person.full_name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate hover:text-[#007fff] transition-colors">
                {person.full_name || 'Anonymous User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {person.headline || 'Healthcare Professional'}
              </p>
            </div>
          </Link>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnect(person.id);
            }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
          >
            <UserPlusIcon className="w-3 h-3 mr-1" />
            Connect
          </Button>
        </div>
      ))}
    </div>
  );
}
