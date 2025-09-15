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
  getUserEventsCount
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

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const [individualsData, institutionsData, requestsData, connectionsData, statsData] = await Promise.all([
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
        ])
      ]);

      // Combine individuals and institutions, removing duplicates by ID
      const allSuggestions = [...individualsData, ...institutionsData];
      const uniqueSuggestions = allSuggestions.filter((profile, index, self) => 
        index === self.findIndex(p => p.id === profile.id)
      );

      // Add connection status and follow status to suggestions
      const enrichedSuggestions = await Promise.all(
        uniqueSuggestions.map(async (profile) => {
          let connectionStatus: 'none' | 'pending' | 'connected' = 'none';
          let followStatus: 'following' | 'not_following' = 'not_following';
          
          if (profile.profile_type === 'institution') {
            // For institutions, check follow status using new function
            const isFollowingUser = await getFollowStatus(user.id, profile.id);
            followStatus = isFollowingUser ? 'following' : 'not_following';
          } else {
            // For individuals, check connection status
            const status = await getConnectionStatus(user.id, profile.id);
            connectionStatus = (status as 'none' | 'pending' | 'connected') || 'none';
          }
          
          return {
            ...profile,
            connection_status: connectionStatus,
            follow_status: followStatus,
            mutual_connections: (profile as any).mutual_connections || 0,
          };
        })
      );

      setSuggestions(enrichedSuggestions);
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
    } catch (error) {
      toast.error('Failed to complete action');
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
  const filteredSuggestions = suggestions.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group suggestions by categories
  const healthcareSuggestions = filteredSuggestions.filter(p => 
    p.headline?.toLowerCase().includes('healthcare') ||
    p.headline?.toLowerCase().includes('medical') ||
    p.headline?.toLowerCase().includes('doctor') ||
    p.headline?.toLowerCase().includes('nurse') ||
    p.headline?.toLowerCase().includes('pharmacy')
  );

  const recentActivitySuggestions = filteredSuggestions.filter(p => 
    !healthcareSuggestions.includes(p)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Manage my network */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage my network</h3>
                
                <div className="space-y-3">
                  <Link 
                    href="/network/connections" 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Connections</span>
                    </div>
                    <span className="text-gray-500 font-medium">{formatNumber(networkStats.connections)}</span>
                  </Link>

                  <Link 
                    href="/network/following" 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Following & followers</span>
                    </div>
                  </Link>

                  <Link 
                    href="/groups" 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Groups</span>
                    </div>
                    <span className="text-gray-500 font-medium">{formatNumber(networkStats.groups)}</span>
                  </Link>

                  <Link 
                    href="/events" 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Events</span>
                    </div>
                    <span className="text-gray-500 font-medium">{formatNumber(networkStats.events)}</span>
                  </Link>

                  <Link 
                    href="/network/pages" 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Pages</span>
                    </div>
                    <span className="text-gray-500 font-medium">{formatNumber(networkStats.pages)}</span>
                  </Link>

                  <Link 
                    href="/newsletters" 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <NewspaperIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">Newsletters</span>
                    </div>
                    <span className="text-gray-500 font-medium">{formatNumber(networkStats.newsletters)}</span>
                  </Link>
                </div>

                {/* Footer Links */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
                    <Link href="/accessibility" className="hover:text-gray-900 transition-colors">Accessibility</Link>
                    <Link href="/help" className="hover:text-gray-900 transition-colors">Help Center</Link>
                    <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy & Terms</Link>
                    <Link href="/ad-choices" className="hover:text-gray-900 transition-colors">Ad Choices</Link>
                    <Link href="/advertising" className="hover:text-gray-900 transition-colors">Advertising</Link>
                    <Link href="/business-services" className="hover:text-gray-900 transition-colors">Business Services</Link>
                    <Link href="/app" className="hover:text-gray-900 transition-colors">Get the App</Link>
                    <Link href="/more" className="hover:text-gray-900 transition-colors col-span-2">More</Link>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">kendraa Corporation © 2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Top Navigation Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left Side - Navigation */}
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => setActiveTab('grow')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'grow'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Grow
                    </button>
                    <button
                      onClick={() => setActiveTab('catch-up')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'catch-up'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Catch up
                    </button>
                  </div>

                  {/* Right Side - Search */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Invitations Section */}
              {connectionRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Invitations ({connectionRequests.length})
                      </h3>
                      <Link 
                        href="/network/requests" 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Show all
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {connectionRequests.slice(0, 3).map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <Avatar
                            src={request.requester.avatar_url}
                            alt={request.requester.full_name || 'User'}
                            size="md"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {request.requester.full_name}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {request.requester.headline || 'Healthcare Professional'}
                            </p>
                            <p className="text-gray-500 text-sm">
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
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectConnection(request.id)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
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

              {/* People you may know - Healthcare */}
              {healthcareSuggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        People in the Healthcare industry you may know
                      </h3>
                      <Link 
                        href="/network/suggestions" 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Show all
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {healthcareSuggestions.slice(0, 8).map((profile) => (
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
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {profile.full_name}
                            </h4>
                            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                              {profile.headline || 'Healthcare Professional'}
                            </p>
                            <p className="text-gray-500 text-xs mb-3">
                              {(profile.mutual_connections || 0) > 0 && (
                                <span>
                                  {profile.mutual_connections} mutual connection{(profile.mutual_connections || 0) !== 1 ? 's' : ''}
                                </span>
                              )}
                            </p>
                            <button
                              onClick={() => handleConnect(
                                profile.id, 
                                profile.profile_type === 'institution' ? 'institution' : 'individual'
                              )}
                              disabled={profile.connection_status === 'pending' || profile.follow_status === 'following'}
                              className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                profile.connection_status === 'pending' || profile.follow_status === 'following'
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {profile.connection_status === 'pending' 
                                ? 'Pending' 
                                : profile.follow_status === 'following'
                                ? 'Following'
                                : profile.profile_type === 'institution'
                                ? '+ Follow'
                                : '+ Connect'
                              }
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* People you may know - Recent Activity */}
              {recentActivitySuggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        People you may know based on your recent activity
                      </h3>
                      <Link 
                        href="/network/suggestions" 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Show all
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recentActivitySuggestions.map((profile) => (
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
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {profile.full_name}
                            </h4>
                            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                              {profile.headline || 'Healthcare Professional'}
                            </p>
                            <p className="text-gray-500 text-xs mb-3">
                              {(profile.mutual_connections || 0) > 0 && (
                                <span>
                                  {profile.mutual_connections} mutual connection{(profile.mutual_connections || 0) !== 1 ? 's' : ''}
                                </span>
                              )}
                            </p>
                            <button
                              onClick={() => handleConnect(
                                profile.id, 
                                profile.profile_type === 'institution' ? 'institution' : 'individual'
                              )}
                              disabled={profile.connection_status === 'pending' || profile.follow_status === 'following'}
                              className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                profile.connection_status === 'pending' || profile.follow_status === 'following'
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {profile.connection_status === 'pending' 
                                ? 'Pending' 
                                : profile.follow_status === 'following'
                                ? 'Following'
                                : profile.profile_type === 'institution'
                                ? '+ Follow'
                                : '+ Connect'
                              }
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredSuggestions.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search terms' : 'We\'ll show you people to connect with here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}