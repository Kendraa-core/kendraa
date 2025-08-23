'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, PlusIcon, HashtagIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getTrendingTopics, getSuggestedConnections } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';
import type { Profile } from '@/types/database.types';

interface PeopleCardProps {
  name: string;
  title: string;
  imageSrc?: string;
}

const PeopleCard = ({ name, title, imageSrc = '' }: PeopleCardProps) => (
  <div className="flex items-start space-x-3 mb-4">
    {imageSrc ? (
      <Image
        src={imageSrc}
        alt={name}
        width={48}
        height={48}
        className="rounded-full"
      />
    ) : (
      <UserCircleIcon className="h-12 w-12 text-gray-400" />
    )}
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
      <p className="text-xs text-gray-500 truncate">{title}</p>
      <button className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center">
        Connect
      </button>
    </div>
  </div>
);

export default function RightSidebar() {
  const { user } = useAuth();
  const [trendingTopics, setTrendingTopics] = useState<Array<{ hashtag: string; count: number }>>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load trending topics
        const topics = await getTrendingTopics(5);
        setTrendingTopics(topics);
        
        // Load suggested connections
        const connections = await getSuggestedConnections(user.id, 3);
        setSuggestedConnections(connections);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Trending Topics */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Trending Topics</h3>
        <div className="space-y-2 sm:space-y-3">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="w-4 h-4 text-primary-600" />
                  <span className="text-sm sm:text-base text-gray-700 font-medium">{topic.hashtag}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">{formatNumber(topic.count)} posts</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No trending topics yet</p>
          )}
        </div>
      </div>



      {/* People You May Know */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">People You May Know</h3>
        <div className="space-y-3 sm:space-y-4">
          {suggestedConnections.length > 0 ? (
            suggestedConnections.map((connection) => (
              <div key={connection.id} className="flex items-center space-x-3">
                <Avatar
                  src={connection.avatar_url}
                  alt={connection.full_name || 'User'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                    {connection.full_name || 'Unknown User'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {connection.headline || 'Healthcare Professional'}
                  </p>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-medium">
                  Connect
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No suggestions available</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a href="/network" className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-medium">
            See all
          </a>
        </div>
      </div>
    </div>
  );
} 