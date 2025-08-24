'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import Avatar from '@/components/common/Avatar';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  UserPlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckIcon,
  XCircleIcon,
  MapPinIcon
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
  const [activeTab, setActiveTab] = useState<'suggestions' | 'connections' | 'requests'>('suggestions');

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
        getSuggestedConnectionsWithMutualCounts(user.id, 12),
        getSuggestedInstitutions(user.id, 6),
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

  const filteredConnections = connections.filter(connection =>
    connection.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.headline?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <p className="text-gray-600 mt-1">Connect with healthcare professionals and institutions</p>
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
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-azure-500 text-azure-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserPlusIcon className="w-4 h-4" />
                  Suggestions ({filteredSuggestions.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'connections'
                    ? 'border-azure-500 text-azure-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4" />
                  Connections ({filteredConnections.length})
                </div>
              </button>
              {connectionRequests.length > 0 && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'requests'
                      ? 'border-azure-500 text-azure-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserPlusIcon className="w-4 h-4" />
                    Requests ({connectionRequests.length})
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuggestions.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                         <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
                     <p className="text-gray-500">We&apos;ll show you people you may know based on your profile and connections.</p>
                  </div>
                ) : (
                  filteredSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar
                          src={suggestion.avatar_url}
                          alt={suggestion.full_name || 'User'}
                          size="lg"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ClickableProfileName
                              userId={suggestion.id}
                              name={suggestion.full_name || 'Unknown User'}
                              userType={suggestion.user_type || 'individual'}
                              className="text-lg font-semibold text-gray-900 truncate"
                            />
                            {suggestion.profile_type === 'institution' && (
                              <BuildingOfficeIcon className="w-4 h-4 text-azure-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {suggestion.headline || 'Healthcare Professional'}
                          </p>
                          {suggestion.location && (
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              {suggestion.location}
                            </div>
                          )}
                          {suggestion.mutual_connections && suggestion.mutual_connections > 0 && (
                            <p className="text-xs text-azure-600 font-medium">
                              {suggestion.mutual_connections} mutual connection{suggestion.mutual_connections !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {suggestion.profile_type === 'institution' ? (
                          // Institution - Show Follow/Unfollow
                          suggestion.follow_status === 'following' ? (
                            <button
                              onClick={() => handleUnfollow(suggestion.id)}
                              className="w-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckIcon className="w-4 h-4" />
                              Following
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(suggestion.id, 'institution')}
                              className="w-full px-4 py-2 text-sm font-medium bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <UserPlusIcon className="w-4 h-4" />
                              Follow
                            </button>
                          )
                        ) : (
                          // Individual - Show Connect
                          suggestion.connection_status === 'none' && (
                            <button
                              onClick={() => handleConnect(suggestion.id, 'individual')}
                              className="w-full px-4 py-2 text-sm font-medium bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <UserPlusIcon className="w-4 h-4" />
                              Connect
                            </button>
                          )
                        )}
                        {suggestion.connection_status === 'pending' && (
                          <button
                            disabled
                            className="w-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <UserPlusIcon className="w-4 h-4" />
                            Request Sent
                          </button>
                        )}
                        {suggestion.connection_status === 'connected' && (
                          <button
                            disabled
                            className="w-full px-4 py-2 text-sm font-medium bg-azure-100 text-azure-700 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Connected
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConnections.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-500">Start connecting with healthcare professionals to build your network.</p>
                  </div>
                ) : (
                  filteredConnections.map((connection) => (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar
                          src={connection.avatar_url}
                          alt={connection.full_name || 'User'}
                          size="lg"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <ClickableProfileName
                            userId={connection.id}
                            name={connection.full_name || 'Unknown User'}
                            userType={connection.user_type || 'individual'}
                            className="text-lg font-semibold text-gray-900 truncate"
                          />
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {connection.headline || 'Healthcare Professional'}
                          </p>
                          {connection.location && (
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              {connection.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && connectionRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectionRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar
                        src={request.requester.avatar_url}
                        alt={request.requester.full_name || 'User'}
                        size="lg"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <ClickableProfileName
                          userId={request.requester.id}
                          name={request.requester.full_name || 'Unknown User'}
                          userType={request.requester.user_type || 'individual'}
                          className="text-lg font-semibold text-gray-900 truncate"
                        />
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {request.requester.headline || 'Healthcare Professional'}
                        </p>
                        {request.requester.location && (
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            {request.requester.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 