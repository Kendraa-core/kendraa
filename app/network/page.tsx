'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { 
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckIcon,
  XCircleIcon,
  MapPinIcon,
  PlusIcon,
  BellIcon,
  XMarkIcon,
  ClockIcon,
  ChevronRightIcon,
  UsersIcon,
  SparklesIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  NewspaperIcon,
  UserPlusIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  getSuggestedConnectionsWithMutualCounts,
  getSuggestedInstitutions,
  getConnectionRequests, 
  getConnections,
  getConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  followUser,
  unfollowUser,
  isFollowing,
  followInstitution,
  unfollowInstitution,
  getFollowStatus,
  getConnectionCount,
  getUserGroupsCount,
  getUserPagesCount,
  getUserNewslettersCount,
  getUserEventsCount,
} from '@/lib/queries';
import { Profile, ConnectionWithProfile } from '@/types/database.types';
import { formatNumber } from '@/lib/utils';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS
} from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ProfilePreview extends Profile {
  mutual_connections?: number;
  connection_status?: 'none' | 'pending' | 'connected';
  follow_status?: 'following' | 'not_following';
}

interface NetworkStats {
  connections: number;
  groups: number;
  events: number;
  pages: number;
  newsletters: number;
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ProfilePreview[]>([]);
  const [individuals, setIndividuals] = useState<ProfilePreview[]>([]);
  const [institutions, setInstitutions] = useState<ProfilePreview[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    connections: 0,
    groups: 0,
    events: 0,
    pages: 0,
    newsletters: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'grow' | 'catch-up'>('grow');
  const [canSendRequests, setCanSendRequests] = useState(true);

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const [individualsData, institutionsData, requestsData, connectionsData, statsData, canSend] = await Promise.all([
        getSuggestedConnectionsWithMutualCounts(user.id, 20),
        getSuggestedInstitutions(user.id, 10),
        getConnectionRequests(user.id),
        getConnections(user.id),
        Promise.all([
          getConnectionCount(user.id),
          getUserGroupsCount(user.id),
          getUserEventsCount(user.id),
          getUserPagesCount(user.id),
          getUserNewslettersCount(user.id)
        ]),
        true // Assume user can send requests
      ]);

      setCanSendRequests(canSend);

      // Separate individuals and institutions
      const enrichedIndividuals = await Promise.all(
        individualsData.map(async (profile) => {
          const status = await getConnectionStatus(user.id, profile.id);
          const connectionStatus = (status as 'none' | 'pending' | 'connected') || 'none';
          
          return {
            ...profile,
            connection_status: connectionStatus,
            follow_status: 'not_following' as const,
            mutual_connections: (profile as any).mutual_connections || 0,
          };
        })
      );

      const enrichedInstitutions = await Promise.all(
        institutionsData.map(async (profile) => {
          const isFollowingUser = await getFollowStatus(user.id, profile.id);
          const followStatus: 'following' | 'not_following' = isFollowingUser ? 'following' : 'not_following';
          
          return {
            ...profile,
            connection_status: 'none' as const,
            follow_status: followStatus,
            mutual_connections: 0,
          };
        })
      );

      // Set separate state variables
      setIndividuals(enrichedIndividuals);
      setInstitutions(enrichedInstitutions);
      
      // Combine all suggestions for backward compatibility
      const allSuggestions = [...enrichedIndividuals, ...enrichedInstitutions];
      setSuggestions(allSuggestions);
      setConnectionRequests(requestsData);
      setConnections(connectionsData);
      setNetworkStats({
        connections: statsData[0],
        groups: statsData[1],
        events: statsData[2],
        pages: statsData[3],
        newsletters: statsData[4]
      });
    } catch (error) {
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  const handleConnect = async (profileId: string, profileType: 'individual' | 'institution') => {
    if (!user?.id) return;
    
    if (!canSendRequests) {
      toast.error('Institutions cannot send connection or follow requests');
      return;
    }
    
    try {
      if (profileType === 'institution') {
        // For institutions, use follow system (automatic acceptance)
        const success = await followInstitution(user.id, profileId);
        
        if (success) {
          // Update local state
          setSuggestions(prev => prev.map(p => 
            p.id === profileId ? { ...p, follow_status: 'following' } : p
          ));
          toast.success('Now following this institution!');
        } else {
          toast.error('Failed to follow institution');
        }
      } else {
        // For individuals, use connection system
        const success = await sendConnectionRequest(user.id, profileId);
        
        if (success) {
          // Update local state
          setSuggestions(prev => prev.map(p => 
            p.id === profileId ? { ...p, connection_status: 'pending' } : p
          ));
          toast.success('Connection request sent!');
        } else {
          toast.error('Failed to send connection request');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete action');
    }
  };

  const handleAcceptConnection = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await acceptConnectionRequest(requestId);
      if (success) {
        setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('Connection accepted!');
        // Refresh network data
        fetchNetworkData();
      } else {
        toast.error('Failed to accept connection');
      }
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const handleRejectConnection = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await rejectConnectionRequest(requestId);
      if (success) {
        setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('Connection request declined');
      } else {
        toast.error('Failed to decline connection');
      }
    } catch (error) {
      toast.error('Failed to decline connection');
    }
  };

  const handleDismissSuggestion = (profileId: string) => {
    setSuggestions(prev => prev.filter(p => p.id !== profileId));
  };

  // Filter suggestions based on search
  const filteredIndividuals = individuals.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstitutions = institutions.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group individuals by categories
  const healthcareIndividuals = filteredIndividuals.filter(p => 
    p.headline?.toLowerCase().includes('healthcare') ||
    p.headline?.toLowerCase().includes('medical') ||
    p.headline?.toLowerCase().includes('doctor') ||
    p.headline?.toLowerCase().includes('nurse') ||
    p.headline?.toLowerCase().includes('pharmacy')
  );

  const recentActivityIndividuals = filteredIndividuals.filter(p => 
    !healthcareIndividuals.includes(p)
  ).slice(0, 8);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Join the Network</h2>
          <p className="text-gray-600 mb-6">Sign in to connect with healthcare professionals</p>
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
    return <LoadingSpinner variant="fullscreen" text="Loading your network..." />;
  }

  return (
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >

          {/* Navigation Tabs */}
          <div className={`${COMPONENTS.card.base} mb-6`}>
            <div className="p-6">
              <div className="flex items-center justify-center space-x-8">
                <button
                  onClick={() => setActiveTab('grow')}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'grow'
                      ? `${COMPONENTS.button.primary}`
                      : `${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} hover:bg-gray-100`
                  }`}
                >
                  Grow
                </button>
                <button
                  onClick={() => setActiveTab('catch-up')}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'catch-up'
                      ? `${COMPONENTS.button.primary}`
                      : `${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} hover:bg-gray-100`
                  }`}
                >
                  Catch up
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Invitations Section */}
            {connectionRequests.length > 0 && (
              <div className={`${COMPONENTS.card.base}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${TYPOGRAPHY.heading.h3}`}>
                      Invitations ({connectionRequests.length})
                    </h3>
                    <Link 
                      href="/network/requests" 
                      className={`${TEXT_COLORS.accent} hover:text-blue-700 text-sm font-medium`}
                    >
                      Show all
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {connectionRequests.slice(0, 5).map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Avatar
                          src={request.requester.avatar_url}
                          alt={request.requester.full_name || 'User'}
                          size="lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`${TYPOGRAPHY.body.medium} font-semibold`}>
                              {request.requester.full_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              follows you and is inviting you to connect
                            </span>
                          </div>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2`}>
                            {request.requester.headline || 'Healthcare Professional'}
                          </p>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                            {request.requester.location && (
                              <span className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {request.requester.location}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptConnection(request.id)}
                            className={`${COMPONENTS.button.primary} px-4 py-2 text-sm font-medium`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectConnection(request.id)}
                            className={`${COMPONENTS.button.secondary} px-4 py-2 text-sm font-medium`}
                          >
                            Ignore
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Healthcare Institutions */}
            {filteredInstitutions.length > 0 && (
              <div className={`${COMPONENTS.card.base}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${TYPOGRAPHY.heading.h3}`}>
                      Healthcare Institutions
                    </h3>
                    <Link 
                      href="/network/suggestions" 
                      className={`${TEXT_COLORS.accent} hover:text-blue-700 text-sm font-medium`}
                    >
                      Show all
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredInstitutions.slice(0, 8).map((profile) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => handleDismissSuggestion(profile.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        
                        <div className="text-center">
                          <Avatar
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Institution'}
                            size="lg"
                            className="mx-auto mb-3"
                          />
                          <h4 className={`${TYPOGRAPHY.body.medium} font-semibold mb-1`}>
                            {profile.full_name}
                          </h4>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2 line-clamp-2`}>
                            {profile.headline || 'Healthcare Institution'}
                          </p>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-3`}>
                            {profile.location && (
                              <span className="flex items-center justify-center">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {profile.location}
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => handleConnect(profile.id, 'institution')}
                            disabled={profile.follow_status === 'following'}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                              profile.follow_status === 'following'
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : `${COMPONENTS.button.primary}`
                            }`}
                          >
                            {profile.follow_status === 'following' ? 'Following' : '+ Follow'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* People you may know - Healthcare */}
            {healthcareIndividuals.length > 0 && (
              <div className={`${COMPONENTS.card.base}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${TYPOGRAPHY.heading.h3}`}>
                      Healthcare Professionals you may know
                    </h3>
                    <Link 
                      href="/network/suggestions" 
                      className={`${TEXT_COLORS.accent} hover:text-blue-700 text-sm font-medium`}
                    >
                      Show all
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {healthcareIndividuals.slice(0, 8).map((profile) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => handleDismissSuggestion(profile.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        
                        <div className="text-center">
                          <Avatar
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            size="lg"
                            className="mx-auto mb-3"
                          />
                          <h4 className={`${TYPOGRAPHY.body.medium} font-semibold mb-1`}>
                            {profile.full_name}
                          </h4>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2 line-clamp-2`}>
                            {profile.headline || 'Healthcare Professional'}
                          </p>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-3`}>
                            {(profile.mutual_connections || 0) > 0 && (
                              <span>
                                {profile.mutual_connections} mutual connection{(profile.mutual_connections || 0) !== 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => handleConnect(profile.id, 'individual')}
                            disabled={profile.connection_status === 'pending'}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                              profile.connection_status === 'pending'
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : `${COMPONENTS.button.primary}`
                            }`}
                          >
                            {profile.connection_status === 'pending' ? 'Pending' : '+ Connect'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* People you may know - Recent Activity */}
            {recentActivityIndividuals.length > 0 && (
              <div className={`${COMPONENTS.card.base}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${TYPOGRAPHY.heading.h3}`}>
                      People you may know based on your recent activity
                    </h3>
                    <Link 
                      href="/network/suggestions" 
                      className={`${TEXT_COLORS.accent} hover:text-blue-700 text-sm font-medium`}
                    >
                      Show all
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recentActivityIndividuals.map((profile) => (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => handleDismissSuggestion(profile.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        
                        <div className="text-center">
                          <Avatar
                            src={profile.avatar_url}
                            alt={profile.full_name || 'User'}
                            size="lg"
                            className="mx-auto mb-3"
                          />
                          <h4 className={`${TYPOGRAPHY.body.medium} font-semibold mb-1`}>
                            {profile.full_name}
                          </h4>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2 line-clamp-2`}>
                            {profile.headline || 'Healthcare Professional'}
                          </p>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-3`}>
                            {(profile.mutual_connections || 0) > 0 && (
                              <span>
                                {profile.mutual_connections} mutual connection{(profile.mutual_connections || 0) !== 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => handleConnect(profile.id, 'individual')}
                            disabled={profile.connection_status === 'pending'}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                              profile.connection_status === 'pending'
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : `${COMPONENTS.button.primary}`
                            }`}
                          >
                            {profile.connection_status === 'pending' ? 'Pending' : '+ Connect'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredIndividuals.length === 0 && filteredInstitutions.length === 0 && (
              <div className={`${COMPONENTS.card.base} text-center py-12`}>
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>No suggestions found</h3>
                <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                  {searchQuery ? 'Try adjusting your search terms' : 'We\'ll show you people to connect with here'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}