'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  NewspaperIcon, 
  ClockIcon,
  TagIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const newsCategories = [
  'All News',
  'Medical Research',
  'Healthcare Technology', 
  'Policy & Regulation',
  'Industry Updates',
  'Clinical Trials',
  'Medical Education',
  'Global Health'
];

const featuredNews = [
  {
    id: 1,
    title: 'Breakthrough in Cancer Immunotherapy Shows 90% Success Rate',
    excerpt: 'New CAR-T cell therapy demonstrates unprecedented results in treating aggressive lymphomas, offering hope for thousands of patients worldwide.',
    category: 'Medical Research',
    author: 'Dr. Sarah Chen',
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    image: '/api/placeholder/600/300',
    views: 15420,
    bookmarked: false
  },
  {
    id: 2,
    title: 'AI-Powered Diagnostic Tool Reduces Misdiagnosis by 40%',
    excerpt: 'Revolutionary machine learning algorithm helps radiologists detect early-stage diseases with unprecedented accuracy across multiple medical imaging modalities.',
    category: 'Healthcare Technology',
    author: 'Dr. Michael Rodriguez',
    publishedAt: '2024-01-14',
    readTime: '4 min read',
    image: '/api/placeholder/600/300',
    views: 12850,
    bookmarked: true
  },
  {
    id: 3,
    title: 'Global Healthcare Access Initiative Reaches 50 Million Patients',
    excerpt: 'International collaboration brings essential medical services to underserved communities across 25 countries, setting new standards for global health equity.',
    category: 'Global Health',
    author: 'Dr. Amara Okafor',
    publishedAt: '2024-01-13',
    readTime: '6 min read',
    image: '/api/placeholder/600/300',
    views: 9630,
    bookmarked: false
  }
];

const recentNews = [
  {
    id: 4,
    title: 'New FDA Guidelines for Digital Health Apps',
    excerpt: 'Updated regulatory framework provides clearer pathways for medical app approval and patient safety standards.',
    category: 'Policy & Regulation',
    author: 'Dr. Jennifer Park',
    publishedAt: '2024-01-12',
    readTime: '3 min read',
    views: 7840
  },
  {
    id: 5,
    title: 'Telemedicine Usage Stabilizes at 3x Pre-Pandemic Levels',
    excerpt: 'Long-term analysis shows sustained adoption of remote healthcare delivery across all medical specialties.',
    category: 'Healthcare Technology',
    author: 'Dr. Robert Kim',
    publishedAt: '2024-01-11',
    readTime: '4 min read',
    views: 6520
  },
  {
    id: 6,
    title: 'Medical School Enrollment Reaches Record High',
    excerpt: 'Increased interest in healthcare careers drives 15% growth in medical education applications nationwide.',
    category: 'Medical Education',
    author: 'Dr. Lisa Thompson',
    publishedAt: '2024-01-10',
    readTime: '3 min read',
    views: 5210
  }
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All News');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set([2]));

  const toggleBookmark = (articleId: number) => {
    const newBookmarked = new Set(bookmarkedArticles);
    if (newBookmarked.has(articleId)) {
      newBookmarked.delete(articleId);
    } else {
      newBookmarked.add(articleId);
    }
    setBookmarkedArticles(newBookmarked);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <NewspaperIcon className="w-20 h-20 text-[#007fff] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Medical News & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest developments in healthcare, medical research, and industry innovations.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#007fff]/10 p-6 shadow-lg mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Search Bar */}
            <div className="flex-1">
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
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {newsCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-[#007fff] text-white shadow-lg'
                      : 'bg-[#007fff]/10 text-[#007fff] hover:bg-[#007fff]/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-black mb-8">Featured Stories</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredNews.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-[#007fff]/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Article Image */}
                <div className="relative h-48 bg-gradient-to-br from-[#007fff]/20 to-[#007fff]/10 flex items-center justify-center">
                  <NewspaperIcon className="w-16 h-16 text-[#007fff]/40" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#007fff] text-white rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    {bookmarkedArticles.has(article.id) ? (
                      <BookmarkSolidIcon className="w-5 h-5 text-[#007fff]" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-black mb-3 line-clamp-2 group-hover:text-[#007fff] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>By {article.author}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" />
                        {formatViews(article.views)}
                      </span>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#007fff]/10 text-[#007fff] rounded-xl hover:bg-[#007fff]/20 transition-colors font-medium">
                    Read Full Article
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* Recent News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-black mb-8">Recent Updates</h2>
          
          <div className="space-y-6">
            {recentNews.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-[#007fff]/10 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  
                  {/* Article Icon */}
                  <div className="w-16 h-16 bg-[#007fff]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#007fff]/20 transition-colors">
                    <NewspaperIcon className="w-8 h-8 text-[#007fff]" />
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl font-bold text-black group-hover:text-[#007fff] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className="p-2 hover:bg-[#007fff]/10 rounded-lg transition-colors"
                        >
                          {bookmarkedArticles.has(article.id) ? (
                            <BookmarkSolidIcon className="w-5 h-5 text-[#007fff]" />
                          ) : (
                            <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-[#007fff]" />
                          )}
                        </button>
                        <button className="p-2 hover:bg-[#007fff]/10 rounded-lg transition-colors">
                          <ShareIcon className="w-5 h-5 text-gray-400 hover:text-[#007fff]" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    {/* Article Meta */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="px-3 py-1 bg-[#007fff]/10 text-[#007fff] rounded-full font-medium">
                        {article.category}
                      </span>
                      <span>By {article.author}</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        {formatViews(article.views)}
                      </span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 duration-200">
              Load More Articles
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
