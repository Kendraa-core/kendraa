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
      <div className="professional-card">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Trending Topics</h3>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trendingTopics.length === 0) {
    return (
      <div className="professional-card">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Trending Topics</h3>
          <div className="text-center py-4">
            <HashtagIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No trending topics yet</p>
            <p className="text-xs text-gray-400 mt-1">Start posting with hashtags!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-card">
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Trending Topics</h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.hashtag} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HashtagIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {topic.hashtag}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {topic.count} {topic.count === 1 ? 'post' : 'posts'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 