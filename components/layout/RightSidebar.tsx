'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  NewspaperIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getSuggestedConnections, followUser } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';
import type { Profile } from '@/types/database.types';

// Updated interface to match GNews API structure
interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  // Adding a random reader count for display purposes
  readers: number;
}

interface RightSidebarProps {
  connectionCount?: number;
  isInstitution?: boolean;
}

export default function RightSidebar({ connectionCount = 0, isInstitution = false }: RightSidebarProps) {
  const { user } = useAuth();
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());

  // This new function fetches news from GNews and uses the same cache as your NewsPage
  const fetchTopHealthcareNews = useCallback(async (): Promise<NewsItem[]> => {
    // Define shared cache keys and duration
    const CACHE_KEY_ARTICLES = 'gnews_articles_cache';
    const CACHE_KEY_TIMESTAMP = 'gnews_timestamp_cache';
    const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

    if (typeof window !== 'undefined') {
      const cachedArticlesJSON = localStorage.getItem(CACHE_KEY_ARTICLES);
      const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
      const now = new Date().getTime();

      // If valid cache exists, use it
      if (cachedArticlesJSON && cachedTimestamp) {
        if (now - parseInt(cachedTimestamp, 10) < CACHE_DURATION_MS) {
          console.log("Loading sidebar news from cache.");
          const cachedArticles = JSON.parse(cachedArticlesJSON);
          // Map to NewsItem and add random readers
          return cachedArticles.slice(0, 5).map((article: any) => ({
            ...article,
            readers: Math.floor(Math.random() * 5000) + 1000,
          }));
        }
      }
    }

    // If cache is stale or empty, fetch from API
    console.log("Fetching new sidebar news from GNews API.");
    const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
    if (!apiKey) {
      console.error("GNews API key is not configured.");
      return []; // Return empty if no key
    }

    const query = "healthcare OR medical OR pharma OR clinical trial OR hospital";
    const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&sortby=publishedAt&apikey=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors ? data.errors[0] : 'Failed to fetch news');
      }

      const validArticles = data.articles.filter((article: any) => article.image && article.description);

      // Save the full result to cache for the main news page to use
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(validArticles));
        localStorage.setItem(CACHE_KEY_TIMESTAMP, new Date().getTime().toString());
      }
      
      // Map and return the top 5 for the sidebar
      return validArticles.slice(0, 5).map((article: any) => ({
        ...article,
        readers: Math.floor(Math.random() * 5000) + 1000,
      }));

    } catch (error) {
      console.error("Failed to fetch sidebar news:", error);
      return []; // Return empty on error
    }
  }, []);


  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
          setLoading(false);
          return;
      };
      
      try {
        setLoading(true);
        
        // Load data in parallel
        const newsPromise = fetchTopHealthcareNews();
        const connectionsPromise = isInstitution ? Promise.resolve([]) : getSuggestedConnections(user.id, 3);
        
        const [news, connections] = await Promise.all([newsPromise, connectionsPromise]);
        
        setTopNews(news);
        setSuggestedConnections(connections);

      } catch (error) {
        console.error('Error loading right sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, isInstitution, fetchTopHealthcareNews]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleConnect = async (userId: string) => {
    if (!user?.id || connectingUsers.has(userId)) return;
    
    setConnectingUsers(prev => new Set(prev).add(userId));
    
    try {
      const result = await followUser(user.id, userId, 'individual', 'individual');
      if (result) {
        // Remove the user from suggestions
        setSuggestedConnections(prev => prev.filter(conn => conn.id !== userId));
      }
    } catch (error) {
      console.error('Error connecting to user:', error);
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-8 bg-gray-200 rounded"></div>
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
              <a 
                key={index} 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block p-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <h4 className="text-xs font-medium text-gray-900 group-hover:text-[#007fff] transition-colors line-clamp-2 mb-1">
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
              </a>
            ))}
            <div className="pt-2">
              <Link href="/news" className="text-xs text-[#007fff] hover:text-[#007fff]/80 font-medium">
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

      {/* People You May Know - Only for individual users */}
      {!isInstitution && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">People You May Know</h3>
            <Link href="/network" className="text-xs text-[#007fff] hover:text-[#007fff]/80 font-medium">
              See all
            </Link>
          </div>
          
          {suggestedConnections.length > 0 ? (
            <div className="space-y-3">
              {suggestedConnections.map((connection) => (
                <Link key={connection.id} href={`/profile/${connection.id}`} className="block">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                    <Avatar
                      src={connection.avatar_url}
                      name={connection.full_name || 'User'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate hover:text-[#007fff] transition-colors">
                        {connection.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {connection.headline || 'Healthcare Professional'}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleConnect(connection.id);
                      }}

                      className="text-xs font-medium text-[#007fff] hover:text-[#007fff]/80 bg-white px-2 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"

                    >
                      {connectingUsers.has(connection.id) ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </Link>
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
      )}
    </div>
  );
}
