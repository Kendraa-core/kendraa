'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { searchUsers } from '@/lib/queries';

interface SearchResult {
  id: string;
  full_name: string;
  headline?: string;
  avatar_url?: string;
  user_type: 'individual' | 'institution';
}

export default function UserSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    router.push(`/profile/${result.id}`);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  }, [router]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          setResults([]);
          setSelectedIndex(-1);
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  // Search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchUsers(query.trim());
        setResults(searchResults);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearchClick = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <button
        onClick={handleSearchClick}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-96 overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search people, institutions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div>
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 ${
                        index === selectedIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={result.avatar_url}
                          alt={result.full_name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {result.full_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {result.headline || (result.user_type === 'institution' ? 'Healthcare Institution' : 'Healthcare Professional')}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {result.user_type === 'institution' ? 'Institution' : 'Individual'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Start typing to search</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↑</kbd> <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to select, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 