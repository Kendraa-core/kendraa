'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { 
  NewspaperIcon, 
  ClockIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

// Define the structure of a GNews article
interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const savedBookmarks = localStorage.getItem('bookmarkedNews');
      return savedBookmarks ? new Set(JSON.parse(savedBookmarks)) : new Set();
    }
    return new Set();
  });

  const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

  useEffect(() => {
    const fetchNewsWithCache = async () => {
      setLoading(true);
      setError(null);

      // Define cache keys and duration (12 hours in milliseconds)
      const CACHE_KEY_ARTICLES = 'gnews_articles_cache';
      const CACHE_KEY_TIMESTAMP = 'gnews_timestamp_cache';
      const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; 

      if (typeof window !== 'undefined') {
        const cachedArticlesJSON = localStorage.getItem(CACHE_KEY_ARTICLES);
        const cachedTimestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
        const now = new Date().getTime();

        // Check if valid cache exists
        if (cachedArticlesJSON && cachedTimestamp) {
          const timeSinceLastFetch = now - parseInt(cachedTimestamp, 10);
          if (timeSinceLastFetch < CACHE_DURATION_MS) {
            console.log("Loading news from cache. It is less than 12 hours old.");
            setArticles(JSON.parse(cachedArticlesJSON));
            setLoading(false);
            return; // Exit early, no API call needed
          }
        }
      }
      
      console.log("Cache is stale or empty. Fetching new data from GNews API.");

      if (!GNEWS_API_KEY) {
        setError("GNews API key is not configured. Please check your .env.local file.");
        setLoading(false);
        return;
      }

      const query = "healthcare OR medical OR pharma OR clinical trial OR hospital";
      const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&sortby=publishedAt&apikey=${GNEWS_API_KEY}`;
      
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.errors ? data.errors[0] : 'Failed to fetch news.');
        }

        const validArticles = data.articles.filter((article: Article) => article.image && article.description);
        setArticles(validArticles);

        // Save the new data and timestamp to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(validArticles));
          localStorage.setItem(CACHE_KEY_TIMESTAMP, new Date().getTime().toString());
        }
      } catch (e: any) {
        console.error("GNews API Error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsWithCache();
  }, [GNEWS_API_KEY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarkedNews', JSON.stringify(Array.from(bookmarkedArticles)));
    }
  }, [bookmarkedArticles]);

  const toggleBookmark = (articleUrl: string) => {
    const newBookmarked = new Set(bookmarkedArticles);
    if (newBookmarked.has(articleUrl)) {
      newBookmarked.delete(articleUrl);
    } else {
      newBookmarked.add(articleUrl);
    }
    setBookmarkedArticles(newBookmarked);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const featuredNews = filteredArticles.slice(0, 3);
  const recentNews = filteredArticles.slice(3, 9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section - Just Logo */}
            <div className="flex items-center">
              <Link href="/">
                <Logo size="md" className="h-10 w-10" />
              </Link>
            </div>
            
            {/* Navigation Links - Centered and Consistent */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Features
              </Link>
              <Link href="/#vision" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Our Vision
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                About
              </Link>
              <Link href="/news" className="text-[#007fff] font-medium">
                News
              </Link>
            </div>
            
            {/* Action Buttons - Consistent Alignment */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/signin"
                className="border border-gray-300 text-gray-700 hover:text-[#007fff] hover:border-[#007fff] px-4 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/signup"
                className="bg-[#007fff] text-white px-6 py-2 rounded-lg hover:bg-[#007fff]/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <NewspaperIcon className="w-20 h-20 text-[#007fff] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Medical News & Updates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest developments in healthcare, medical research, and industry innovations.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-2xl border border-[#007fff]/10 p-6 shadow-lg mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medical news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200"
            />
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#007fff] rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg text-gray-500">Fetching the latest healthcare news...</p>
          </div>
        )}

        {error && (
            <div className="mt-10 max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex">
                    <div className="py-1"><ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-4"/></div>
                    <div>
                        <p className="font-bold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        )}

        {!loading && !error && (
          <>
            {/* Featured News */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-16">
              <h2 className="text-3xl font-bold text-black mb-8">Featured Stories</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {featuredNews.map((article, index) => (
                  <motion.article key={article.url} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="bg-white rounded-2xl border border-[#007fff]/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
                    <div className="relative h-48 w-full">
                      <Image src={article.image} alt={article.title} width={400} height={192} className="w-full h-full object-cover"/>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#007fff] text-white rounded-full text-xs font-medium line-clamp-1">{article.source.name}</span>
                      </div>
                      <button onClick={() => toggleBookmark(article.url)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        {bookmarkedArticles.has(article.url) ? <BookmarkSolidIcon className="w-5 h-5 text-[#007fff]" /> : <BookmarkIcon className="w-5 h-5 text-gray-600" />}
                      </button>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-black mb-3 line-clamp-3 group-hover:text-[#007fff] transition-colors">{article.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{article.description}</p>
                      <div className="text-xs text-gray-500 mb-4">
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-[#007fff]/10 text-[#007fff] rounded-xl hover:bg-[#007fff]/20 transition-colors font-medium">
                        Read Full Article <ArrowRightIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>

            {/* Recent News */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <h2 className="text-3xl font-bold text-black mb-8">Recent Updates</h2>
              <div className="space-y-6">
                {recentNews.map((article, index) => (
                  <motion.article key={article.url} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="bg-white rounded-2xl border border-[#007fff]/10 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block sm:w-48 sm:h-32 w-full h-48 flex-shrink-0">
                        <Image src={article.image} alt={article.title} width={192} height={128} className="w-full h-full object-cover rounded-lg"/>
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-xl font-bold text-black group-hover:text-[#007fff] transition-colors line-clamp-2">
                             <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => toggleBookmark(article.url)} className="p-2 hover:bg-[#007fff]/10 rounded-lg transition-colors">
                              {bookmarkedArticles.has(article.url) ? <BookmarkSolidIcon className="w-5 h-5 text-[#007fff]" /> : <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-[#007fff]" />}
                            </button>
                            <button className="p-2 hover:bg-[#007fff]/10 rounded-lg transition-colors" onClick={() => navigator.share ? navigator.share({ title: article.title, url: article.url }) : null}>
                              <ShareIcon className="w-5 h-5 text-gray-400 hover:text-[#007fff]" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
                          <span className="px-3 py-1 bg-[#007fff]/10 text-[#007fff] rounded-full font-medium text-xs">{article.source.name}</span>
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
              <div className="text-center mt-12">
                <button className="px-8 py-4 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
                  Load More Articles
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

