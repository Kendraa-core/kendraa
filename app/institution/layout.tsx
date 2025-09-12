'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseStorageUrl } from '@/lib/utils';
import {
  HomeIcon,
  PencilIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  PencilIcon as PencilSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  CalendarIcon as CalendarSolidIcon
} from '@heroicons/react/24/solid';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle role-based redirects
  useEffect(() => {
    if (!user) {
      // User not logged in, redirect to signin
      router.push('/signin');
      return;
    }

    if (profile) {
      // Check if user is an institution
      const isInstitution = profile.user_type === 'institution' || profile.profile_type === 'institution';
      
      if (!isInstitution) {
        // User is not an institution, redirect to regular feed
        router.push('/feed');
        return;
      }
      
      // User is an institution, allow access
      setIsLoading(false);
    }
  }, [user, profile, router]);

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'Home',
      href: '/institution/feed',
      icon: HomeIcon,
      iconSolid: HomeSolidIcon,
      current: pathname === '/institution/feed'
    },
    {
      name: 'Edit Profile',
      href: '/institution/profile',
      icon: PencilIcon,
      iconSolid: PencilSolidIcon,
      current: pathname === '/institution/profile'
    },
    {
      name: 'Jobs',
      href: '/institution/jobs',
      icon: BriefcaseIcon,
      iconSolid: BriefcaseSolidIcon,
      current: pathname.startsWith('/institution/jobs')
    },
    {
      name: 'Events',
      href: '/institution/events',
      icon: CalendarIcon,
      iconSolid: CalendarSolidIcon,
      current: pathname.startsWith('/institution/events')
    }
  ];

  const handleLogout = () => {
    // Implement logout logic here
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#007fff] rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Kendraa</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-[#007fff]/10 text-[#007fff]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <Link href="/institution/feed" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#007fff] rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Kendraa</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-[#007fff]/10 text-[#007fff]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url.startsWith('http') ? profile.avatar_url : getSupabaseStorageUrl('avatars', profile.avatar_url)}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'Institution'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff] w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url.startsWith('http') ? profile.avatar_url : getSupabaseStorageUrl('avatars', profile.avatar_url)}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {profile?.full_name || 'Institution'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
