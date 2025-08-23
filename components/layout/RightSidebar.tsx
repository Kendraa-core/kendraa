'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, PlusIcon, NewspaperIcon } from '@heroicons/react/24/outline';
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
}

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
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load top healthcare news
        const news = await fetchTopHealthcareNews();
        setTopNews(news);
        
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
      },
      {
        title: "Global Healthcare Summit Addresses Mental Health Crisis",
        description: "World leaders commit to increased funding and resources for mental health services worldwide.",
        url: "#",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: "Global Health"
      },
      {
        title: "New Telemedicine Platform Connects Rural Patients with Specialists",
        description: "Innovative platform bridges healthcare gaps in underserved communities across the country.",
        url: "#",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: "Digital Health"
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
      {/* Top Healthcare News */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Healthcare News</h3>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        
        {topNews.length > 0 ? (
          <div className="space-y-4">
            {topNews.map((news, index) => (
              <div 
                key={index} 
                className="group cursor-pointer"
                onClick={() => window.open(news.url, '_blank')}
              >
                <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <NewspaperIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                        {news.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {news.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
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
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <NewspaperIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No news available</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
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