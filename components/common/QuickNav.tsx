'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function QuickNav() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      icon: MagnifyingGlassIcon,
      label: 'Search',
      href: '/search',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: UserPlusIcon,
      label: 'Network',
      href: '/network',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: ChatBubbleLeftIcon,
      label: 'Messages',
      href: '/messaging',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: BellIcon,
      label: 'Notifications',
      href: '/notifications',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      icon: UserCircleIcon,
      label: 'Profile',
      href: `/profile/${user?.id}`,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return (
    <div className="relative">
      <>
        {isOpen && (
          <div
            
            
            
            className="absolute bottom-16 right-0 space-y-3"
          >
            {quickActions.map((action, index) => (
              <div
                key={action.label}
                
                
                
                
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${action.color}`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </>

      {/* Main FAB */}
      <button
        
        
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg transition-colors duration-300 ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white flex items-center justify-center`}
      >
        <div
          
          
        >
          <PlusIcon className="w-6 h-6" />
        </div>
      </button>
    </div>
  );
} 