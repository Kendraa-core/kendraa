'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { usePageRefresh } from '@/hooks/usePageRefresh';
import { 
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
  const [canSendRequests, setCanSendRequests] = useState(true);
  
  // Initialize page refresh hook
  usePageRefresh();

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

      // Separate individuals and institutions, filtering out already connected/followed
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

      // Filter out already connected individuals and already followed institutions
      const filteredIndividuals = enrichedIndividuals.filter(profile => 
        profile.connection_status === 'none'
      );
      
      const filteredInstitutions = enrichedInstitutions.filter(profile => 
        profile.follow_status === 'not_following'
      );

      // Set separate state variables with filtered data
      setIndividuals(filteredIndividuals);
      setInstitutions(filteredInstitutions);
      
      // Combine filtered suggestions for backward compatibility
      const allSuggestions = [...filteredIndividuals, ...filteredInstitutions];
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
          
          // Dispatch event to trigger page refresh
          window.dispatchEvent(new CustomEvent('follow-status-updated', {
            detail: { targetUserId: profileId, targetUserType: 'institution' }
          }));
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
          
          // Dispatch event to trigger page refresh
          window.dispatchEvent(new CustomEvent('connection-request-sent', {
            detail: { targetUserId: profileId, targetUserType: 'individual' }
          }));
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
        
        // Dispatch event to trigger page refresh
        window.dispatchEvent(new CustomEvent('connection-accepted', {
          detail: { requestId }
        }));
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
        
        // Dispatch event to trigger page refresh
        window.dispatchEvent(new CustomEvent('connection-rejected', {
          detail: { requestId }
        }));
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


  // Group individuals by categories
  const healthcareIndividuals = individuals.filter(p => 
    p.headline?.toLowerCase().includes('healthcare') ||
    p.headline?.toLowerCase().includes('medical') ||
    p.headline?.toLowerCase().includes('doctor') ||
    p.headline?.toLowerCase().includes('nurse') ||
    p.headline?.toLowerCase().includes('pharmacy')
  );

  const recentActivityIndividuals = individuals.filter(p => 
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
    return <LoadingSpinner  text="Loading your network..." />;
  }

  return (
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Floating Island */}
          <div className="w-80 flex-shrink-0">
            <div className={`${COMPONENTS.card.base} sticky top-24`}>
              <div className="p-6">
                <h3 className={`${TYPOGRAPHY.heading.h3} mb-4`}>Manage my network</h3>
                
                <div className="space-y-1">
                  <Link
                    href="/network/connections"
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="w-5 h-5 text-[#007fff] group-hover:text-[#007fff]/80" />
                      <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} group-hover:text-[#007fff]`}>Connections</span>
                    </div>
                    <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {networkStats.connections}
                    </span>
                  </Link>
                  
                  <Link
                    href="/network/following"
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-[#007fff] group-hover:text-[#007fff]/80" />
                      <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} group-hover:text-[#007fff]`}>Following & followers</span>
                    </div>
                    <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {connections.length}
                    </span>
                  </Link>
                  
                  <Link
                    href="/groups"
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="w-5 h-5 text-[#007fff] group-hover:text-[#007fff]/80" />
                      <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} group-hover:text-[#007fff]`}>Groups</span>
                    </div>
                    <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {networkStats.groups}
                    </span>
                  </Link>
                  
                  <Link
                    href="/events"
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="w-5 h-5 text-[#007fff] group-hover:text-[#007fff]/80" />
                      <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} group-hover:text-[#007fff]`}>Events</span>
                    </div>
                    <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {networkStats.events}
                    </span>
                  </Link>
                  
                  <Link
                    href="/network/pages"
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-[#007fff] group-hover:text-[#007fff]/80" />
                      <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} group-hover:text-[#007fff]`}>Pages</span>
                    </div>
                    <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {networkStats.pages}
                    </span>
                  </Link>
                  
                  <Link
                    href="/network/newsletters"
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <NewspaperIcon className="w-5 h-5 text-[#007fff] group-hover:text-[#007fff]/80" />
                      <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} group-hover:text-[#007fff]`}>Newsletters</span>
                    </div>
                    <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {networkStats.newsletters}
                    </span>
                  </Link>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <Link
                      href="/about"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      About
                    </Link>
                    <Link
                      href="/accessibility"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Accessibility
                    </Link>
                    <Link
                      href="/help"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Help Center
                    </Link>
                    <Link
                      href="/privacy"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Privacy & Terms
                    </Link>
                    <Link
                      href="/ad-choices"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Ad Choices
                    </Link>
                    <Link
                      href="/advertising"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Advertising
                    </Link>
                    <Link
                      href="/business-services"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Business Services
                    </Link>
                    <Link
                      href="/get-app"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      Get the Kendraa app
                    </Link>
                    <Link
                      href="/more"
                      className={`block ${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} transition-colors`}
                    >
                      More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >


              {/* Main Content */}
              <div className="space-y-6">
                {/* Network Overview */}
                <div className={`${COMPONENTS.card.base}`}>
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-[#007fff]" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${TYPOGRAPHY.body.medium} font-semibold`}>Your Network Overview</h3>
                        <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                          {networkStats.connections} connections • {connections.length} following • {networkStats.groups} groups
                        </p>
                      </div>
                      <Link 
                        href="/network/connections"
                        className={`px-4 py-2 ${COMPONENTS.button.primary} rounded-lg hover:bg-blue-700 transition-colors font-medium`}
                      >
                        Manage Network
                      </Link>
                    </div>
        </div>
      </div>

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
                        {request.requester.headline || (request.requester.specialization && request.requester.specialization.length > 0 ? request.requester.specialization[0] : null) || 'Healthcare Professional'}
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
            {institutions.length > 0 && (
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
                    {institutions.slice(0, 8).map((profile) => (
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
                            {profile.headline || profile.specialization || 'Healthcare Institution'}
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
                    {profile.headline || (profile.specialization && profile.specialization.length > 0 ? profile.specialization[0] : null) || 'Healthcare Professional'}
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
                            {profile.headline || (profile.specialization && profile.specialization.length > 0 ? profile.specialization[0] : null) || 'Healthcare Professional'}
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
            {individuals.length === 0 && institutions.length === 0 && (
              <div className={`${COMPONENTS.card.base} text-center py-12`}>
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>No suggestions found</h3>
                <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                  We&apos;ll show you people to connect with here
                </p>
          </div>
                )}
              </div>
            </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
} 