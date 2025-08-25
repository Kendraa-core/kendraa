'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/lib/queries';
import Header from '@/components/layout/Header';
import RightSidebar from '@/components/layout/RightSidebar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        router.push('/signin');
        return;
      }

      try {
        const userProfile = await getProfile(user.id);
        
        // Update profile in context if it's different
        if (userProfile && (!profile || profile.id !== userProfile.id)) {
          await updateProfile(userProfile);
        }

        // Calculate profile completion percentage
        const calculateProfileCompletion = () => {
          if (!userProfile) return 0;
          
          const fields = [
            userProfile.full_name,
            userProfile.headline,
            userProfile.bio,
            userProfile.location,
            userProfile.avatar_url,
            Array.isArray(userProfile.specialization) ? userProfile.specialization.length > 0 : userProfile.specialization
          ];
          
          const completedFields = fields.filter(field => {
            if (typeof field === 'string') {
              return field && field.trim() !== '';
            }
            return field;
          }).length;
          return Math.round((completedFields / fields.length) * 100);
        };

        const completionPercentage = calculateProfileCompletion();
        
        // Redirect to onboarding if profile completion is below 80%
        if (completionPercentage < 80) {
          router.push('/onboarding');
          return;
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        router.push('/onboarding');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.id, router, updateProfile, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex pt-16">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block lg:w-80 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:overflow-y-auto lg:bg-gray-50 lg:border-r lg:border-gray-200">
          <div className="p-6">
            <LeftSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-80">
          <div className="flex max-w-7xl mx-auto">
            {/* Center Content */}
            <div className="flex-1 min-w-0 max-w-4xl mx-auto">
              <main className="p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>

            {/* Right Sidebar - Desktop */}
            <div className="hidden xl:block xl:w-80 xl:flex-shrink-0">
              <div className="p-6">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 