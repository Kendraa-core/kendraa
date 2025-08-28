'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchUsers, searchJobs, searchEvents } from '@/lib/queries';
import Avatar from '@/components/common/Avatar';
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarDaysIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'user' | 'job' | 'event';
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  avatar_url?: string;
  user_type?: 'individual' | 'institution';
  company?: string;
  date?: string;
  attendees_count?: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'user' | 'job' | 'event'>('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const [users, jobs, events] = await Promise.all([
        searchUsers(searchQuery),
        searchJobs(searchQuery),
        searchEvents(searchQuery)
      ]);

      const allResults: SearchResult[] = [
        ...users.map(user => ({
          id: user.id,
          type: 'user' as const,
          title: user.full_name || 'Unknown User',
          subtitle: user.headline || 'Healthcare Professional',
          description: user.bio,
          location: user.location,
          avatar_url: user.avatar_url,
          user_type: user.user_type
        })),
        ...jobs.map(job => ({
          id: job.id,
          type: 'job' as const,
          title: job.title,
          subtitle: job.company || 'Healthcare Organization',
          description: job.description,
          location: job.location,
          company: job.company
        })),
        ...events.map(event => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          subtitle: event.organizer_name || 'Healthcare Event',
          description: event.description,
          location: event.location,
          date: event.date,
          attendees_count: event.attendees_count
        }))
      ];

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserIcon className="w-5 h-5 text-azure-500" />;
      case 'job':
        return <BriefcaseIcon className="w-5 h-5 text-green-500" />;
      case 'event':
        return <CalendarDaysIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        return `/profile/${result.id}`;
      case 'job':
        return `/jobs/${result.id}`;
      case 'event':
        return `/events/${result.id}`;
      default:
        return '#';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-gray-600">
          Found {filteredResults.length} results
        </p>
      </div>

      {/* Search Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
        <div className="flex">
          {[
            { key: 'all', label: 'All', count: results.length },
            { key: 'user', label: 'People', count: results.filter(r => r.type === 'user').length },
            { key: 'job', label: 'Jobs', count: results.filter(r => r.type === 'job').length },
            { key: 'event', label: 'Events', count: results.filter(r => r.type === 'event').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-azure-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={getResultLink(result)}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Icon/Avatar */}
                <div className="flex-shrink-0">
                  {result.type === 'user' ? (
                    <Avatar
                      src={result.avatar_url}
                      alt={result.title}
                      size="lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getResultIcon(result.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {result.title}
                    </h3>
                    {result.type === 'user' && result.user_type && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.user_type === 'institution' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.user_type === 'institution' ? 'Institution' : 'Individual'}
                      </span>
                    )}
                  </div>
                  
                  {result.subtitle && (
                    <p className="text-gray-600 mb-2">{result.subtitle}</p>
                  )}
                  
                  {result.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {result.description}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {result.location && (
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{result.location}</span>
                      </div>
                    )}
                    
                    {result.type === 'event' && result.date && (
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{new Date(result.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {result.type === 'event' && result.attendees_count !== undefined && (
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{result.attendees_count} attendees</span>
                      </div>
                    )}
                    
                    {result.type === 'job' && result.company && (
                      <div className="flex items-center space-x-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{result.company}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              Try searching with different keywords or check your spelling.
            </p>
            <Link
              href="/feed"
              className="inline-flex items-center px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors"
            >
              Back to Feed
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
