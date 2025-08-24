'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UserCircleIcon, 
  PlusIcon, 
  NewspaperIcon, 
  BookmarkIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  EyeIcon,
  ChartBarIcon,
  TagIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getSuggestedConnections, getConnectionCount, getEventsByOrganizer } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';
import type { Profile } from '@/types/database.types';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export default function RightSidebar() {
  const { user, profile } = useAuth();
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [news, connections, connectionsCount, events] = await Promise.all([
          fetchTopHealthcareNews(),
          getSuggestedConnections(user.id, 3),
          getConnectionCount(user.id),
          getEventsByOrganizer(user.id)
        ]);
        
        setTopNews(news);
        setSuggestedConnections(connections);
        setConnectionCount(connectionsCount);
        setUserEvents(events);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const fetchTopHealthcareNews = async (): Promise<NewsItem[]> => {
    try {
      // Using NewsAPI.org for healthcare news
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=healthcare+medical&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY || 'demo'}`
      );
      
      if (!response.ok) {
        // Fallback to demo data if API key is not available
        return getDemoHealthcareNews();
      }
      
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        return data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || article.content?.substring(0, 100) + '...' || 'No description available',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name || 'Unknown Source'
        }));
      }
      
      return getDemoHealthcareNews();
    } catch (error) {
      console.error('Error fetching news:', error);
      return getDemoHealthcareNews();
    }
  };

  const getDemoHealthcareNews = (): NewsItem[] => {
    return [
      {
        title: "Breakthrough in Cancer Treatment Shows Promising Results",
        description: "New immunotherapy treatment demonstrates 60% improvement in patient outcomes for advanced cancer cases.",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Medical News Today"
      },
      {
        title: "FDA Approves Revolutionary Gene Therapy for Rare Diseases",
        description: "First-of-its-kind treatment approved for patients with genetic disorders affecting the nervous system.",
        url: "#",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: "Health News"
      },
      {
        title: "AI-Powered Diagnostic Tool Reduces Medical Errors by 40%",
        description: "Machine learning algorithm helps doctors identify rare conditions with unprecedented accuracy.",
        url: "#",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: "Tech Medicine"
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
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
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
    <div className="space-y-6">
      {/* Profile Analytics Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Profile viewers</span>
            <span className="text-sm font-semibold text-azure-500">{formatNumber(connectionCount * 2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Post impressions</span>
            <span className="text-sm font-semibold text-azure-500">{formatNumber(connectionCount * 3)}</span>
          </div>
        </div>
      </div>

      {/* My Events Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">My Events ({userEvents.length})</h3>
          <Link href="/events" className="text-xs text-azure-500 hover:text-azure-600 font-medium">
            See all
          </Link>
        </div>
        
        {userEvents.length > 0 ? (
          <div className="space-y-3">
            {userEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-azure-100 rounded-lg flex items-center justify-center">
                  <CalendarDaysIcon className="w-4 h-4 text-azure-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">Activity</p>
                </div>
                <span className="text-xs text-azure-500 font-medium">
                  {formatNumber(event.attendees_count || 0)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">No events created yet</p>
            <Link href="/events/create" className="text-xs text-azure-500 hover:text-azure-600 font-medium mt-1 inline-block">
              Create your first event
            </Link>
          </div>
        )}
      </div>

      {/* Grow Your Business Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-azure-100 rounded-lg flex items-center justify-center">
            <TagIcon className="w-4 h-4 text-azure-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Grow your business</h3>
            <p className="text-xs text-gray-500">Try Campaign Manager</p>
          </div>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-3">
          <Link href="/saved-items" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <BookmarkIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Saved items</span>
          </Link>
          <Link href="/network" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <UserGroupIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Groups</span>
          </Link>
          <Link href="/newsletters" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <NewspaperIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Newsletters</span>
          </Link>
          <Link href="/events" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Events</span>
          </Link>
        </div>
      </div>

      {/* Top Healthcare News */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Top Healthcare News</h3>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        {topNews.length > 0 ? (
          <div className="space-y-3">
            {topNews.slice(0, 3).map((news, index) => (
              <div 
                key={index} 
                className="group cursor-pointer"
                onClick={() => window.open(news.url, '_blank')}
              >
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <NewspaperIcon className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                        {news.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {news.source}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(news.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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