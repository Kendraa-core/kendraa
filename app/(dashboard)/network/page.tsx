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
  PlusIcon,
  BellIcon,
  XMarkIcon,
  ClockIcon
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
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions', 'connections', 'requests'

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Network</h1>
          <p className="text-gray-600 mb-4">
            Connect with healthcare professionals and discover new opportunities
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-center sm:justify-start space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-2" />
                {suggestions.length} suggestions
              </span>
              <span className="flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                {connections.length} connections
              </span>
              {connectionRequests.length > 0 && (
                <span className="flex items-center text-azure-600">
                  <BellIcon className="w-4 h-4 mr-2" />
                  {connectionRequests.length} requests
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md mx-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search people, institutions, or specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azure-500 focus:border-transparent text-gray-700 placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-azure-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'connections'
                ? 'bg-azure-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Connections ({connections.length})
          </button>
          {connectionRequests.length > 0 && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'requests'
                  ? 'bg-azure-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Requests ({connectionRequests.length})
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      size="lg"
                      className="mx-auto mb-4"
                    />
                    <ClickableProfileName
                      userId={profile.id}
                      name={profile.full_name || 'Anonymous User'}
                      userType={profile.profile_type}
                      className="text-lg font-semibold text-gray-900 mb-1"
                    />
                    <p className="text-sm text-gray-600 mb-2">
                      {profile.headline || 'Healthcare Professional'}
                    </p>
                    {profile.location && (
                      <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        {profile.location}
                      </div>
                    )}
                    {profile.mutual_connections && profile.mutual_connections > 0 && (
                      <p className="text-xs text-azure-600 mb-4">
                        {profile.mutual_connections} mutual connection{profile.mutual_connections !== 1 ? 's' : ''}
                      </p>
                    )}
                    <div className="flex justify-center">
                      {profile.profile_type === 'institution' ? (
                        // Institution - Show Follow/Unfollow
                        profile.follow_status === 'following' ? (
                          <button
                            onClick={() => handleUnfollow(profile.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Following</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnect(profile.id, 'institution')}
                            className="flex items-center space-x-2 px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors text-sm font-medium"
                          >
                            <PlusIcon className="w-4 h-4" />
                            <span>Follow</span>
                          </button>
                        )
                      ) : (
                        // Individual - Show Connect
                        <button
                          onClick={() => handleConnect(profile.id, 'individual')}
                          disabled={profile.connection_status === 'pending' || profile.connection_status === 'connected'}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            profile.connection_status === 'connected'
                              ? 'bg-green-100 text-green-700'
                              : profile.connection_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-azure-500 text-white hover:bg-azure-600'
                          }`}
                        >
                          {profile.connection_status === 'connected' ? (
                            <>
                              <CheckIcon className="w-4 h-4" />
                              <span>Connected</span>
                            </>
                          ) : profile.connection_status === 'pending' ? (
                            <>
                              <ClockIcon className="w-4 h-4" />
                              <span>Pending</span>
                            </>
                          ) : (
                            <>
                              <PlusIcon className="w-4 h-4" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserGroupIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or check back later for new connections.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.length > 0 ? (
              filteredConnections.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      size="lg"
                      className="mx-auto mb-4"
                    />
                    <ClickableProfileName
                      userId={profile.id}
                      name={profile.full_name || 'Anonymous User'}
                      userType={profile.profile_type}
                      className="text-lg font-semibold text-gray-900 mb-1"
                    />
                    <p className="text-sm text-gray-600 mb-2">
                      {profile.headline || 'Healthcare Professional'}
                    </p>
                    {profile.location && (
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        {profile.location}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserGroupIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start connecting with healthcare professionals to build your network.
                    </p>
                    <button
                      onClick={() => setActiveTab('suggestions')}
                      className="bg-azure-500 text-white px-6 py-3 rounded-xl hover:bg-azure-600 transition-colors font-medium"
                    >
                      View suggestions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && connectionRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectionRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <Avatar
                    src={request.requester.avatar_url}
                    alt={request.requester.full_name || 'User'}
                    size="lg"
                    className="mx-auto mb-4"
                  />
                  <ClickableProfileName
                    userId={request.requester.id}
                    name={request.requester.full_name || 'Anonymous User'}
                    userType={request.requester.profile_type}
                    className="text-lg font-semibold text-gray-900 mb-1"
                  />
                  <p className="text-sm text-gray-600 mb-2">
                    {request.requester.headline || 'Healthcare Professional'}
                  </p>
                  {request.requester.location && (
                    <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                      <MapPinIcon className="w-3 h-3 mr-1" />
                      {request.requester.location}
                    </div>
                  )}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors text-sm font-medium"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 