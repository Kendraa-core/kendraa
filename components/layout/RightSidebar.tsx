'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  NewspaperIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getSuggestedConnections } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';
import type { Profile } from '@/types/database.types';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  readers: number;
}

export default function RightSidebar() {
  const { user } = useAuth();
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load data in parallel
        const [news, connections] = await Promise.all([
          fetchTopHealthcareNews(),
          getSuggestedConnections(user.id, 3)
        ]);
        
        setTopNews(news);
        setSuggestedConnections(connections);
      } catch (error) {
        console.error('Error loading right sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const fetchTopHealthcareNews = async (): Promise<NewsItem[]> => {
    try {
      // Check if we have a valid API key
      const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
      if (!apiKey || apiKey === 'demo' || apiKey === 'your_news_api_key_here') {
        // Use demo data if no valid API key
        return getDemoHealthcareNews();
      }

      // Using NewsAPI.org for healthcare news
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=healthcare+medical&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        return getDemoHealthcareNews();
      }
      
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        return data.articles.map((article: any, index: number) => ({
          title: article.title,
          description: article.description || article.content?.substring(0, 100) + '...' || 'No description available',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name || 'Unknown Source',
          readers: Math.floor(Math.random() * 50000) + 1000 // Random reader count for demo
        }));
      }
      
      return getDemoHealthcareNews();
    } catch (error) {
      return getDemoHealthcareNews();
    }
  };

  const getDemoHealthcareNews = (): NewsItem[] => {
    return [
      {
        title: "OpenAI to launch first India office",
        description: "AI company expands global presence with new office in India",
        url: "#",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Tech News",
        readers: 71350
      },
      {
        title: "Benefits or pay - what matters more to employees",
        description: "New study reveals employee preferences in compensation packages",
        url: "#",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "HR News",
        readers: 4844
      },
      {
        title: "AI-focused upskilling surges in healthcare",
        description: "Healthcare professionals increasingly seek AI training",
        url: "#",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Healthcare News",
        readers: 2392
      },
      {
        title: "Real estate eyes bumper sales in Q4",
        description: "Property market shows strong recovery signs",
        url: "#",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Real Estate News",
        readers: 1503
      },
      {
        title: "Global beauty brands bet on India market",
        description: "International beauty companies expand Indian operations",
        url: "#",
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Business News",
        readers: 1164
      }
    ];
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full">
      {/* Top Medical News Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Top Medical News</h3>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Latest stories</h4>
        </div>
        
        {topNews.length > 0 ? (
          <div className="space-y-3">
            {topNews.map((news, index) => (
              <div 
                key={index} 
                className="group cursor-pointer"
                onClick={() => window.open(news.url, '_blank')}
              >
                <div className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-900 group-hover:text-azure-600 transition-colors line-clamp-2 mb-1">
                      {news.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(news.publishedAt)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatNumber(news.readers)} readers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/news" className="text-xs text-azure-500 hover:text-azure-600 font-medium">
                Show more
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <NewspaperIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">No news available</p>
          </div>
        )}
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">People You May Know</h3>
          <Link href="/network" className="text-xs text-azure-500 hover:text-azure-600 font-medium">
            See all
          </Link>
        </div>
        
        {suggestedConnections.length > 0 ? (
          <div className="space-y-3">
            {suggestedConnections.map((connection) => (
              <div key={connection.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                <Avatar
                  src={connection.avatar_url}
                  alt={connection.full_name || 'User'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {connection.full_name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {connection.headline || 'Healthcare Professional'}
                  </p>
                </div>
                <button className="text-xs font-medium text-azure-500 hover:text-azure-600 bg-white px-2 py-1 rounded-lg border border-azure-200 hover:border-azure-300 transition-all duration-200">
                  Connect
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <UserCircleIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">No suggestions available</p>
            <p className="text-xs text-gray-400 mt-1">Expand your network</p>
          </div>
        )}
      </div>
    </div>
  );
} 