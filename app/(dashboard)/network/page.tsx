'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import Avatar from '@/components/common/Avatar';
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
  SparklesIcon
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

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const [individualsData, institutionsData, requestsData, connectionsData] = await Promise.all([
        getSuggestedConnectionsWithMutualCounts(user.id, 20),
        getSuggestedInstitutions(user.id, 10),
        getConnectionRequests(user.id),
        getConnections(user.id)
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
        // For institutions, use follow system
        const success = await followUser(user.id, profileId, 'individual', 'institution');
        
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

  const handleUnfollow = async (profileId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await unfollowUser(user.id, profileId);
      
      if (success) {
        // Update local state
        setSuggestions(prev => prev.map(p => 
          p.id === profileId ? { ...p, follow_status: 'not_following' } : p
        ));
        toast.success('Unfollowed institution');
      } else {
        toast.error('Failed to unfollow institution');
      }
    } catch (error) {
      toast.error('Failed to unfollow institution');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await acceptConnectionRequest(requestId);
      
      if (success) {
        const request = connectionRequests.find(r => r.id === requestId);
        if (request) {
          // Move from requests to connections
          setConnections(prev => [...prev, request.requester]);
          setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
          toast.success(`You are now connected with ${request.requester.full_name}!`);
        }
      } else {
        toast.error('Failed to accept connection request');
      }
    } catch (error) {
      toast.error('Failed to accept connection request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const success = await rejectConnectionRequest(requestId);
      
      if (success) {
        setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
        toast.success('Connection request declined');
      } else {
        toast.error('Failed to decline connection request');
      }
    } catch (error) {
      toast.error('Failed to decline connection request');
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pl-5">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search people and institutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007fff] focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Invitations Section */}
        {connectionRequests.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invitations ({connectionRequests.length})</h2>
              <button className="text-[#007fff] hover:text-[#0066cc] font-semibold text-lg">
                View all
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {connectionRequests.slice(0, 6).map((request) => (
                <div key={request.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-[180px] flex flex-col">
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
                        name={request.requester.full_name || 'Anonymous User'}
                        userType={request.requester.profile_type}
                        className="text-lg font-bold text-gray-900 mb-1"
                      />
                      <p className="text-sm text-gray-600 mb-2">
                        {request.requester.headline || 'Healthcare Professional'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Follows you and is inviting you to connect
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-auto">
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 px-4 py-3 text-sm text-gray-600 hover:text-gray-800 font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 px-4 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#0066cc] transition-colors text-sm font-semibold"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People you may know Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              People in the Healthcare industry you may know
            </h2>
            <button className="text-[#007fff] hover:text-[#0066cc] font-semibold text-lg">
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredSuggestions.slice(0, 15).map((profile) => (
              <div key={profile.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-[500px] flex flex-col">
                <div className="text-center mb-6">
                  <Avatar
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                  <ClickableProfileName
                    userId={profile.id}
                    name={profile.full_name || 'Anonymous User'}
                    userType={profile.profile_type}
                    className="text-lg font-bold text-gray-900 mb-2"
                  />
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {profile.headline || 'Healthcare Professional'}
                  </p>
                  
                  {profile.mutual_connections && profile.mutual_connections > 0 ? (
                    <p className="text-sm text-gray-500 mb-4">
                      {`${profile.mutual_connections} mutual connection${profile.mutual_connections !== 1 ? 's' : ''}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">Based on your profile</p>
                  )}
                </div>
                
                <div className="mt-auto">
                  {profile.profile_type === 'institution' ? (
                    <button
                      onClick={() => profile.follow_status === 'following' 
                        ? handleUnfollow(profile.id) 
                        : handleConnect(profile.id, 'institution')
                      }
                      disabled={profile.follow_status === 'following'}
                      className={`w-full py-3 rounded-xl transition-colors text-sm font-semibold ${
                        profile.follow_status === 'following'
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-[#007fff] text-white hover:bg-[#0066cc]'
                      }`}
                    >
                      {profile.follow_status === 'following' ? 'Following' : '+ Follow'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(profile.id, 'individual')}
                      disabled={profile.connection_status === 'pending' || profile.connection_status === 'connected'}
                      className={`w-full py-3 rounded-xl transition-colors text-sm font-semibold ${
                        profile.connection_status === 'connected'
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : profile.connection_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 cursor-default'
                          : 'bg-[#007fff] text-white hover:bg-[#0066cc]'
                      }`}
                    >
                      {profile.connection_status === 'connected' ? 'Connected' : 
                       profile.connection_status === 'pending' ? 'Pending' : '+ Connect'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredSuggestions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions available</h3>
              <p className="text-gray-600">
                We&apos;re working on finding the right connections for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 