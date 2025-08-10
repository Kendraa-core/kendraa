'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
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
        getSuggestedConnectionsWithMutualCounts(user.id, 8),
        getSuggestedInstitutions(user.id, 4),
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

      // Debug: Log the profile types
      suggestionsData.forEach((profile, index) => {
        debugLog(`Profile ${index}:`, { 
          id: profile.id, 
          name: profile.full_name, 
          type: profile.profile_type,
          mutual_connections: (profile as any).mutual_connections 
        });
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Network</h1>
          <p className="text-slate-600">Connect with healthcare professionals and grow your network</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connection Requests */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Connection Requests</h2>
              {connectionRequests.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No pending requests</p>
              ) : (
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {request.requester.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {request.requester.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {request.requester.headline}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-3 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggested Connections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">People You May Know</h2>
              {filteredSuggestions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No suggestions available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {suggestion.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {suggestion.full_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate mb-2">
                            {suggestion.headline}
                          </p>
                          {suggestion.mutual_connections && (
                            <p className="text-xs text-blue-600">
                              {suggestion.mutual_connections} mutual connections
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        {suggestion.profile_type === 'institution' ? (
                          // Institution - Show Follow/Unfollow
                          suggestion.follow_status === 'following' ? (
                            <button
                              onClick={() => handleUnfollow(suggestion.id)}
                              className="w-full px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Following
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(suggestion.id, 'institution')}
                              className="w-full px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Follow
                            </button>
                          )
                        ) : (
                          // Individual - Show Connect
                          suggestion.connection_status === 'none' && (
                            <button
                              onClick={() => handleConnect(suggestion.id, 'individual')}
                              className="w-full px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Connect
                            </button>
                          )
                        )}
                        {suggestion.connection_status === 'pending' && (
                          <button
                            disabled
                            className="w-full px-3 py-2 text-sm font-medium bg-slate-200 text-slate-500 rounded-lg cursor-not-allowed"
                          >
                            Request Sent
                          </button>
                        )}
                        {suggestion.connection_status === 'connected' && (
                          <button
                            disabled
                            className="w-full px-3 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg cursor-not-allowed"
                          >
                            Connected
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Connections */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">My Connections</h2>
            {connections.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No connections yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {connection.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {connection.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {connection.headline}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 