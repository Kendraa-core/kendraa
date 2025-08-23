'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, PlusIcon, HashtagIcon, StarIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { 
  getPlaceholderMedicalProfessionals, 
  getPlaceholderMedicalGroups, 
  getPlaceholderTrendingTopics,
  formatNumber 
} from '@/lib/utils';

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
  const trendingTopics = getPlaceholderTrendingTopics();
  const suggestedConnections = getPlaceholderMedicalProfessionals();
  const popularGroups = getPlaceholderMedicalGroups();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Trending Topics */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Trending Topics</h3>
        <div className="space-y-2 sm:space-y-3">
          {trendingTopics.slice(0, 5).map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-2">
                <HashtagIcon className="w-4 h-4 text-primary-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">{topic.name}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">{formatNumber(topic.count)} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-purple-900 mb-2">Try Premium for free</h3>
          <p className="text-sm sm:text-base text-purple-700 mb-4">One month free</p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm sm:text-base">
            Try free
          </button>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">People You May Know</h3>
        <div className="space-y-3 sm:space-y-4">
          {suggestedConnections.slice(0, 3).map((connection) => (
            <div key={connection.id} className="flex items-center space-x-3">
              <Avatar
                src={connection.avatar_url}
                alt={connection.full_name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{connection.full_name}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{connection.headline}</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-medium">
                Connect
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a href="/network" className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-medium">
            See all
          </a>
        </div>
      </div>

      {/* Popular Groups */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Popular Groups</h3>
        <div className="space-y-3 sm:space-y-4">
          {popularGroups.slice(0, 3).map((group, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">{group.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{group.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">{formatNumber(group.members)} members</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm sm:text-base font-medium">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 