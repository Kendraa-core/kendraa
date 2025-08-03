'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Home', href: '/feed', icon: HomeIcon },
  { name: 'Network', href: '/network', icon: UserGroupIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Messaging', href: '/messaging', icon: ChatBubbleLeftRightIcon },
  { name: 'Events', href: '/events', icon: CalendarDaysIcon },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [signOut, router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(prev => !prev);
  }, []);

  if (!user) return null;

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/feed" className="flex items-center space-x-2 group">
              <div 
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                
                
              >
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                Kendra
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      
                      
                    >
                      <item.icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{item.name}</span>
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full"
                          
                          
                          
                          style={{ transform: 'translateX(-50%) translateY(8px)' }}
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search professionals, jobs, events..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Link href="/notifications">
                <button
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  
                  
                >
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                </button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                  
                  
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || 'User'}
                    size="sm"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                    {profile?.full_name}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <>
                  {isProfileMenuOpen && (
                    <div
                      
                      
                      
                      
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={profile?.avatar_url}
                            alt={profile?.full_name || 'User'}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {profile?.full_name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {profile?.headline || 'Healthcare Professional'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link href={`/profile/${user.id}`}>
                          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            View Profile
                          </button>
                        </Link>
                        <Link href="/profile/setup">
                          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Settings
                          </button>
                        </Link>
                        <div className="border-t border-gray-100 my-2" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                
                
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <>
          {isMobileMenuOpen && (
            <div
              
              
              
              
              className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Mobile Navigation */}
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        
                        
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      </header>

      {/* Backdrop for mobile menu */}
      <>
        {isMobileMenuOpen && (
          <div
            
            
            
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>

      {/* Backdrop for profile menu */}
      <>
        {isProfileMenuOpen && (
          <div
            
            
            
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileMenuOpen(false)}
          />
        )}
      </>
    </>
  );
} 