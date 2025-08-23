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
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        {trendingTopics.length > 0 ? (
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div 
                key={index} 
                className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <HashtagIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {topic.hashtag}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                    {formatNumber(topic.count)} posts
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HashtagIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No trending topics yet</p>
            <p className="text-xs text-gray-400 mt-1">Start posting to see trends</p>
          </div>
        )}
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">People You May Know</h3>
          <Link href="/network" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            See all
          </Link>
        </div>
        
        {suggestedConnections.length > 0 ? (
          <div className="space-y-4">
            {suggestedConnections.map((connection) => (
              <div key={connection.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                <Avatar
                  src={connection.avatar_url}
                  alt={connection.full_name || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {connection.full_name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {connection.headline || 'Healthcare Professional'}
                  </p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200">
                  Connect
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No suggestions available</p>
            <p className="text-xs text-gray-400 mt-1">Expand your network to see more</p>
          </div>
        )}
      </div>
    </div>
  );
} 