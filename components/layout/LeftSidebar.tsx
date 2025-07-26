'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PlayCircleIcon, ChartBarIcon, BookmarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const NavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
  <Link href={href} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
    <Icon className="h-5 w-5 mr-2 text-gray-500" />
    {label}
  </Link>
);

export default function LeftSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-14 bg-[#A0B4B7]" />
        <div className="p-4 -mt-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-white">
              <div className="w-full h-full rounded-full bg-gray-300" />
            </div>
            <Link href={`/profile/${user.id}`} className="mt-2 text-base font-medium text-gray-900 hover:underline">
              {user.email?.split('@')[0] || 'User'}
            </Link>
            <p className="text-xs text-gray-500">UI/UX Designer</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Who viewed your profile</span>
              <span className="text-blue-600 font-medium">24</span>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Views of your post</span>
              <span className="text-blue-600 font-medium">509</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-lg border border-gray-200">
        <nav className="p-2">
          <NavItem href="/bookmarks" icon={BookmarkIcon} label="My items" />
          <NavItem href="/learning" icon={PlayCircleIcon} label="Learning" />
          <NavItem href="/insights" icon={ChartBarIcon} label="Insights" />
          <NavItem href="/colleagues" icon={UserGroupIcon} label="Find colleagues" />
        </nav>
      </div>

      {/* Followed Hashtags */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium mb-2">Followed Hashtags</h3>
        <div className="flex flex-wrap gap-2">
          {['work', 'business', 'hr', 'userinterface', 'digital', 'userexperience', 'ui', 'freelance'].map((tag) => (
            <Link 
              key={tag} 
              href={`/hashtag/${tag}`}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 