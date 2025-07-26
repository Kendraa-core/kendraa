'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import type { Profile } from '@/types/database.types';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  const dropdownItems: NavItemProps[] = [
    {
      label: 'View Profile',
      icon: UserIcon,
      href: `/profile/${user?.id}`,
    },
    {
      label: 'Create Organization',
      icon: BuildingOfficeIcon,
      href: '/organization/create',
    },
    {
      label: 'Settings',
      icon: Cog6ToothIcon,
      href: '/settings',
    },
    {
      label: 'Help Center',
      icon: QuestionMarkCircleIcon,
      href: '/help',
    },
    {
      label: 'Privacy & Terms',
      icon: ShieldCheckIcon,
      href: '/privacy',
    },
    {
      label: 'Sign Out',
      icon: ArrowRightOnRectangleIcon,
      href: '#',
      onClick: handleSignOut,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/feed" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Kendraa"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">Kendraa</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {profile?.full_name || 'Profile'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={(e) => {
                          if (item.onClick) {
                            e.preventDefault();
                            item.onClick();
                          }
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
} 