'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentIcon, BellIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Newsletter {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  isSubscribed: boolean;
  subscriberCount: number;
  lastIssue?: string;
}

export default function NewslettersPage() {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscribed' | 'discover'>('subscribed');

  useEffect(() => {
    const fetchNewsletters = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // Newsletters functionality not yet implemented in database
        setNewsletters([]);
      } catch (error) {
        console.error('Error fetching newsletters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, [user?.id]);

  const handleSubscribe = (newsletterId: string) => {
    setNewsletters(prev => prev.map(newsletter => 
      newsletter.id === newsletterId 
        ? { ...newsletter, isSubscribed: true, subscriberCount: newsletter.subscriberCount + 1 }
        : newsletter
    ));
  };

  const handleUnsubscribe = (newsletterId: string) => {
    setNewsletters(prev => prev.map(newsletter => 
      newsletter.id === newsletterId 
        ? { ...newsletter, isSubscribed: false, subscriberCount: newsletter.subscriberCount - 1 }
        : newsletter
    ));
  };

  const subscribedNewsletters = newsletters.filter(newsletter => newsletter.isSubscribed);
  const discoverNewsletters = newsletters.filter(newsletter => !newsletter.isSubscribed);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Newsletters</h1>
              <p className="text-gray-600">Stay informed with professional insights and updates</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('subscribed')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'subscribed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Subscribed ({subscribedNewsletters.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Discover ({discoverNewsletters.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                {/* Main spinner */}
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                
                {/* Pulse effect */}
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <p className="text-gray-600 mt-4 text-sm font-medium">Loading newsletters...</p>
              
              {/* Progress dots */}
              <div className="flex justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'subscribed' ? subscribedNewsletters : discoverNewsletters).map((newsletter) => (
              <div key={newsletter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{newsletter.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <BellIcon className="w-4 h-4" />
                      <span>{newsletter.frequency}</span>
                      <span>•</span>
                      <span>{newsletter.subscriberCount.toLocaleString()} subscribers</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {newsletter.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{newsletter.description}</p>
                
                {newsletter.lastIssue && (
                  <p className="text-xs text-gray-500 mb-4">Last issue: {newsletter.lastIssue}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Issues
                  </button>
                  {newsletter.isSubscribed ? (
                    <button
                      onClick={() => handleUnsubscribe(newsletter.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <CheckIcon className="w-3 h-3" />
                      <span>Subscribed</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(newsletter.id)}
                      className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Subscribe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (activeTab === 'subscribed' ? subscribedNewsletters : discoverNewsletters).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Newsletters Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              Professional newsletters functionality is currently under development. 
              You&apos;ll soon be able to subscribe to curated healthcare insights and industry updates.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Feature in development</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
