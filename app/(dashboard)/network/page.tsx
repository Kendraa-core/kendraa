'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import Avatar from '@/components/common/Avatar';
import { 
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  NewspaperIcon,
  CheckIcon,
  XCircleIcon,
  MapPinIcon,
  PlusIcon
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
  isFollowing
} from '@/lib/queries';
import { Profile, ConnectionWithProfile } from '@/types/database.types';
import { formatNumber } from '@/lib/utils';

interface ProfilePreview extends Profile {
  mutual_connections?: number;
  connection_status?: 'none' | 'pending' | 'connected';
  follow_status?: 'following' | 'not_following';
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ProfilePreview[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const debugLog = (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Network] ${message}`, data);
    }
  };

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    debugLog('Fetching network data', { userId: user.id });
    
    try {
      const [individualsData, institutionsData, requestsData, connectionsData] = await Promise.all([
        getSuggestedConnectionsWithMutualCounts(user.id, 20),
        getSuggestedInstitutions(user.id, 10),
        getConnectionRequests(user.id),
        getConnections(user.id)
      ]);

      // Combine individuals and institutions
      const suggestionsData = [...individualsData, ...institutionsData];

      debugLog('Network data fetched', { 
        individuals: individualsData.length,
        institutions: institutionsData.length,
        suggestions: suggestionsData.length,
        requests: requestsData.length,
        connections: connectionsData.length 
      });

      // Add connection status and follow status to suggestions
      const enrichedSuggestions = await Promise.all(
        suggestionsData.map(async (profile) => {
          let connectionStatus: 'none' | 'pending' | 'connected' = 'none';
          let followStatus: 'following' | 'not_following' = 'not_following';
          
          if (profile.profile_type === 'institution') {
            // For institutions, check follow status
            const isFollowingUser = await isFollowing(user.id, profile.id);
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
    } catch (error) {
      debugLog('Error fetching network data', error);
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
    
    debugLog('Handling connect/follow action', { fromUserId: user.id, toUserId: profileId, profileType });
    
    try {
      if (profileType === 'institution') {
        // For institutions, use follow system
        const success = await followUser(user.id, profileId, 'individual', 'institution');
        
        if (success) {
          // Update local state
          setSuggestions(prev => prev.map(p => 
            p.id === profileId ? { ...p, follow_status: 'following' } : p
          ));
          toast.success('Now following this institution!');
          debugLog('Follow action successful', { profileId });
        } else {
          toast.error('Failed to follow institution');
          debugLog('Failed to follow institution', { profileId });
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
          debugLog('Connection request sent successfully', { profileId });
        } else {
          toast.error('Failed to send connection request');
          debugLog('Failed to send connection request', { profileId });
        }
      }
    } catch (error) {
      debugLog('Error in connect/follow action', error);
      toast.error('Failed to complete action');
    }
  };

  const handleUnfollow = async (profileId: string) => {
    if (!user?.id) return;
    
    debugLog('Unfollowing institution', { fromUserId: user.id, toUserId: profileId });
    
    try {
      const success = await unfollowUser(user.id, profileId);
      
      if (success) {
        // Update local state
        setSuggestions(prev => prev.map(p => 
          p.id === profileId ? { ...p, follow_status: 'not_following' } : p
        ));
        toast.success('Unfollowed institution');
        debugLog('Unfollow action successful', { profileId });
      } else {
        toast.error('Failed to unfollow institution');
        debugLog('Failed to unfollow institution', { profileId });
      }
    } catch (error) {
      debugLog('Error unfollowing institution', error);
      toast.error('Failed to unfollow institution');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    debugLog('Accepting connection request', { requestId });
    
    try {
      const success = await acceptConnectionRequest(requestId);
      
      if (success) {
        const request = connectionRequests.find(r => r.id === requestId);
        if (request) {
          // Move from requests to connections
          setConnections(prev => [...prev, request.requester]);
          setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
          toast.success(`You are now connected with ${request.requester.full_name}!`);
          debugLog('Connection request accepted successfully', { requestId });
        }
      } else {
        toast.error('Failed to accept connection request');
        debugLog('Failed to accept connection request', { requestId });
      }
    } catch (error) {
      debugLog('Error accepting connection request', error);
      toast.error('Failed to accept connection request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    debugLog('Rejecting connection request', { requestId });
    
    try {
      const success = await rejectConnectionRequest(requestId);
      
      if (success) {
        setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
        toast.success('Connection request declined');
        debugLog('Connection request rejected successfully', { requestId });
      } else {
        toast.error('Failed to decline connection request');
        debugLog('Failed to reject connection request', { requestId });
      }
    } catch (error) {
      debugLog('Error rejecting connection request', error);
      toast.error('Failed to decline connection request');
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-azure-200 border-t-azure-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Network</h1>
              <p className="text-gray-600 mt-1">Grow and manage your professional network</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <UserGroupIcon className="w-5 h-5" />
              <span>{formatNumber(connections.length)} connections</span>
              {connectionRequests.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-azure-600 font-medium">{connectionRequests.length} pending requests</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search people and institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Manage my network */}
          <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Manage my network</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Connections</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatNumber(connections.length)}</span>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Following & followers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Groups</span>
                  </div>
                  <span className="text-sm text-gray-500">5</span>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Events</span>
                  </div>
                  <span className="text-sm text-gray-500">2</span>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Pages</span>
                  </div>
                  <span className="text-sm text-gray-500">267</span>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <NewspaperIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Newsletters</span>
                  </div>
                  <span className="text-sm text-gray-500">34</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Invitations Section */}
            {connectionRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Invitations ({connectionRequests.length})</h2>
                  <button className="text-sm text-azure-600 hover:text-azure-700 font-medium">
                    Show all
                  </button>
                </div>

                <div className="space-y-4">
                  {connectionRequests.slice(0, 3).map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <Avatar
                        src={request.requester.avatar_url}
                        alt={request.requester.full_name || 'User'}
                        size="lg"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <ClickableProfileName
                            userId={request.requester.id}
                            name={request.requester.full_name || 'Unknown User'}
                            userType={request.requester.user_type || 'individual'}
                            className="text-lg font-semibold text-gray-900"
                          />
                          <CheckIcon className="w-4 h-4 text-azure-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          follows you and is inviting you to connect
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          {request.requester.headline || 'Healthcare Professional'}
                        </p>
                        {request.requester.location && (
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            {request.requester.location}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {Math.floor(Math.random() * 200) + 50} mutual connections
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 text-sm font-medium bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Ignore
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* People You May Know Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  People you may know from healthcare industry
                </h2>
                <button className="text-sm text-azure-600 hover:text-azure-700 font-medium">
                  Show all
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuggestions.slice(0, 6).map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {/* Dismiss button */}
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <XCircleIcon className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                      <Avatar
                        src={suggestion.avatar_url}
                        alt={suggestion.full_name || 'User'}
                        size="lg"
                        className="mx-auto mb-3"
                      />
                      
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <ClickableProfileName
                          userId={suggestion.id}
                          name={suggestion.full_name || 'Unknown User'}
                          userType={suggestion.user_type || 'individual'}
                          className="text-sm font-semibold text-gray-900"
                        />
                        <CheckIcon className="w-3 h-3 text-azure-500" />
                        {suggestion.profile_type === 'institution' && (
                          <BuildingOfficeIcon className="w-3 h-3 text-azure-500" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {suggestion.headline || 'Healthcare Professional'}
                      </p>

                      {suggestion.mutual_connections && suggestion.mutual_connections > 0 && (
                        <p className="text-xs text-gray-500 mb-3">
                          {suggestion.mutual_connections} mutual connection{suggestion.mutual_connections !== 1 ? 's' : ''}
                        </p>
                      )}

                      <div className="mt-3">
                        {suggestion.profile_type === 'institution' ? (
                          // Institution - Show Follow/Unfollow
                          suggestion.follow_status === 'following' ? (
                            <button
                              onClick={() => handleUnfollow(suggestion.id)}
                              className="w-full px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckIcon className="w-3 h-3" />
                              Following
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(suggestion.id, 'institution')}
                              className="w-full px-3 py-2 text-sm font-medium bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <PlusIcon className="w-3 h-3" />
                              Follow
                            </button>
                          )
                        ) : (
                          // Individual - Show Connect
                          suggestion.connection_status === 'none' && (
                            <button
                              onClick={() => handleConnect(suggestion.id, 'individual')}
                              className="w-full px-3 py-2 text-sm font-medium bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <PlusIcon className="w-3 h-3" />
                              Connect
                            </button>
                          )
                        )}
                        {suggestion.connection_status === 'pending' && (
                          <button
                            disabled
                            className="w-full px-3 py-2 text-sm font-medium bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            Request Sent
                          </button>
                        )}
                        {suggestion.connection_status === 'connected' && (
                          <button
                            disabled
                            className="w-full px-3 py-2 text-sm font-medium bg-azure-100 text-azure-700 rounded-lg cursor-not-allowed"
                          >
                            Connected
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 