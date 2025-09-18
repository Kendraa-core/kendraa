'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { 
  ArrowLeftIcon,
  UserIcon,
  UserGroupIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  getConnections,
  getFollowStatus,
  unfollowUser,
  unfollowInstitution
} from '@/lib/queries';
import { Profile } from '@/types/database.types';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY
} from '@/lib/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface FollowingProfile extends Profile {
  follow_status: 'following' | 'not_following';
}

export default function FollowingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState<FollowingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'individuals' | 'institutions'>('individuals');

  const fetchFollowingData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const connectionsData = await getConnections(user.id);
      
      // Enrich with follow status
      const enrichedFollowing = await Promise.all(
        connectionsData.map(async (profile) => {
          const isFollowing = await getFollowStatus(user.id, profile.id);
          return {
            ...profile,
            follow_status: (isFollowing ? 'following' : 'not_following') as 'following' | 'not_following'
          };
        })
      );

      setFollowing(enrichedFollowing);
    } catch (error) {
      toast.error('Failed to load following data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFollowingData();
  }, [fetchFollowingData]);

  const handleUnfollow = async (profileId: string, profileType: 'individual' | 'institution') => {
    if (!user?.id) return;
    
    try {
      let success = false;
      
      if (profileType === 'institution') {
        success = await unfollowInstitution(user.id, profileId);
      } else {
        success = await unfollowUser(user.id, profileId);
      }
      
      if (success) {
        setFollowing(prev => prev.filter(p => p.id !== profileId));
        toast.success('Unfollowed successfully');
      } else {
        toast.error('Failed to unfollow');
      }
    } catch (error) {
      toast.error('Failed to unfollow');
    }
  };

  // Filter and separate following by type
  const filteredFollowing = following.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const individuals = filteredFollowing.filter(p => p.user_type === 'individual');
  const institutions = filteredFollowing.filter(p => p.user_type === 'institution');

  const currentTabData = activeTab === 'individuals' ? individuals : institutions;

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view who you&apos;re following</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner  text="Loading following..." />;
  }

  return (
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className={`${TYPOGRAPHY.heading.h1}`}>Following</h1>
              <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                {following.length} people and institutions
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('individuals')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'individuals'
                  ? 'bg-white text-[#007fff] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Individuals ({individuals.length})
            </button>
            <button
              onClick={() => setActiveTab('institutions')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'institutions'
                  ? 'bg-white text-[#007fff] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Institutions ({institutions.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className={`${COMPONENTS.card.base} mb-6`}>
            <div className="p-4">
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${TEXT_COLORS.secondary}`} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${COMPONENTS.input.base} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {currentTabData.length > 0 ? (
              currentTabData.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${COMPONENTS.card.base}`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        size="lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`${TYPOGRAPHY.body.medium} font-semibold`}>
                            {profile.full_name}
                          </h3>
                          {profile.user_type === 'institution' && (
                            <CheckIcon className="w-4 h-4 text-[#007fff]" />
                          )}
                          <span className="flex items-center text-green-600 text-xs">
                            <HeartIcon className="w-3 h-3 mr-1" />
                            Following
                          </span>
                        </div>
                        <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2`}>
                          {profile.headline || (profile.user_type === 'institution' ? 'Healthcare Institution' : 'Healthcare Professional')}
                        </p>
                        {profile.location && (
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} flex items-center`}>
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {profile.location}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/profile/${profile.id}`}
                          className={`px-4 py-2 ${COMPONENTS.button.primary} text-sm font-medium`}
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleUnfollow(profile.id, profile.user_type as 'individual' | 'institution')}
                          className={`px-4 py-2 ${COMPONENTS.button.secondary} text-sm font-medium`}
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className={`${COMPONENTS.card.base} text-center py-12`}>
                <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>No {activeTab} found</h3>
                <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                  {searchQuery ? 'Try adjusting your search terms' : `You&apos;re not following any ${activeTab} yet`}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
