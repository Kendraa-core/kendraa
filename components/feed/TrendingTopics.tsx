'use client';

import { useState, useEffect } from 'react';
import { getTrendingTopics } from '@/lib/queries';
import { HashtagIcon } from '@heroicons/react/24/outline';

interface TrendingTopic {
  hashtag: string;
  count: number;
}

interface TrendingTopicsProps {
  limit?: number;
}

export default function TrendingTopics({ limit = 5 }: TrendingTopicsProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setLoading(true);
        const topics = await getTrendingTopics(limit);
        setTrendingTopics(topics);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTopics();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <HashtagIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-base truncate">Trending Topics</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-8 ml-2 flex-shrink-0"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <HashtagIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-base truncate">Trending Topics</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <HashtagIcon className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-1 text-sm">No trending topics yet</p>
          <p className="text-xs text-gray-500">Start posting with hashtags to see trending topics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
          <HashtagIcon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-base truncate">Trending Topics</h3>
      </div>
      <div className="space-y-2">
        {trendingTopics.map((topic, index) => (
          <div key={topic.hashtag} className="group cursor-pointer">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 min-w-0">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-6 h-6 bg-primary-100 rounded flex items-center justify-center group-hover:bg-primary-200 transition-colors flex-shrink-0">
                  <HashtagIcon className="w-3 h-3 text-primary-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors truncate">
                  {topic.hashtag}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0 whitespace-nowrap">
                {topic.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 