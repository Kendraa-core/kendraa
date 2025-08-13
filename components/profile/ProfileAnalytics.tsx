'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, DocumentTextIcon, MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface AnalyticsData {
  profileImpressions: {
    count: number;
    change: number;
    period: string;
  };
  postImpressions: {
    count: number;
    change: number;
    period: string;
  };
  searchAppearances: {
    count: number;
    change: number;
    period: string;
  };
  connectionsGrowth: {
    count: number;
    change: number;
    period: string;
  };
}

interface ProfileAnalyticsProps {
  data: AnalyticsData;
  isOwnProfile?: boolean;
}

export default function ProfileAnalytics({ data, isOwnProfile = false }: ProfileAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  const analyticsItems = [
    {
      icon: EyeIcon,
      title: 'Profile impressions',
      description: 'Discover who\'s viewed your profile.',
      count: data.profileImpressions.count,
      change: data.profileImpressions.change,
      period: data.profileImpressions.period,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: DocumentTextIcon,
      title: 'Post impressions',
      description: 'Check out who\'s engaging with your posts.',
      count: data.postImpressions.count,
      change: data.postImpressions.change,
      period: data.postImpressions.period,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Search appearances',
      description: 'See how often you appear in search results.',
      count: data.searchAppearances.count,
      change: data.searchAppearances.change,
      period: data.searchAppearances.period,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: ChartBarIcon,
      title: 'Connections growth',
      description: 'Track your network expansion.',
      count: data.connectionsGrowth.count,
      change: data.connectionsGrowth.change,
      period: data.connectionsGrowth.period,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (!isOwnProfile) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
          <p className="text-sm text-gray-500">Private to you</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7days">Past 7 days</option>
          <option value="30days">Past 30 days</option>
          <option value="90days">Past 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analyticsItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-lg font-semibold text-gray-900">{item.count.toLocaleString()}</h4>
                  {item.change !== 0 && (
                    <div className={`flex items-center space-x-1 ${
                      item.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change > 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(item.change)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <h5 className="font-medium text-gray-900 mb-1">{item.title}</h5>
                <p className="text-sm text-gray-600">{item.description}</p>
                
                {item.period && (
                  <p className="text-xs text-gray-500 mt-2">{item.period}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-2 group">
          <span>Show all analytics</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
