'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchUsers, searchJobs, searchEvents } from '@/lib/queries';
import Avatar from '@/components/common/Avatar';
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarDaysIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon
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
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'user' | 'job' | 'event'>('all');

  useEffect(() => {
    if (query.trim()) {
      setSearchInput(query);
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
        return <UserIcon className="w-5 h-5 text-[#007fff]" />;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search people, jobs, events..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-[#007fff] focus:border-[#007fff] outline-none text-lg shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors text-sm font-medium"
              >
                Search
              </button>
            </div>
          </form>

          {query && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Results for &quot;{query}&quot;
              </h2>
              <p className="text-gray-600">
                Found {filteredResults.length} results
              </p>
            </div>
          )}
        </div>

        {/* Search Tabs - Only show when there are results */}
        {query && results.length > 0 && (
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
                      ? 'bg-[#007fff] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {!query ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#007fff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-10 h-10 text-[#007fff]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Search for people, jobs, and events in the healthcare community. Use the search bar above to get started.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Healthcare Jobs', 'Medical Events', 'Doctors', 'Nurses', 'Hospitals'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchInput(suggestion)}
                  className="px-3 py-1.5 text-sm text-[#007fff] bg-[#007fff]/10 rounded-full hover:bg-[#007fff]/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-4"></div>
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
                      name={result.title}
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
                className="inline-flex items-center px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors"
              >
                Back to Feed
              </Link>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
