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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
            <HashtagIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Trending Topics</h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
            <HashtagIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Trending Topics</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HashtagIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">No trending topics yet</p>
          <p className="text-sm text-gray-500">Start posting with hashtags to see trending topics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
          <HashtagIcon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">Trending Topics</h3>
      </div>
      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div key={topic.hashtag} className="group cursor-pointer">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <HashtagIcon className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                  {topic.hashtag}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {topic.count} {topic.count === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 