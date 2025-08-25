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
  ClockIcon,
  ChevronRightIcon,
  PuzzlePieceIcon
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
  const [activeTab, setActiveTab] = useState('grow'); // 'grow', 'catch-up'

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
    <div className="flex gap-8">
      {/* Left Sidebar - Manage my network */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage my network</h2>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Connections</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatNumber(connections.length)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Following & followers</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Groups</span>
              </div>
              <span className="text-sm font-medium text-gray-900">5</span>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Events</span>
              </div>
              <span className="text-sm font-medium text-gray-900">2</span>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Pages</span>
              </div>
              <span className="text-sm font-medium text-gray-900">267</span>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <NewspaperIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Newsletters</span>
              </div>
              <span className="text-sm font-medium text-gray-900">34</span>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-700">About</a>
              <a href="#" className="hover:text-gray-700">Accessibility</a>
              <a href="#" className="hover:text-gray-700">Help Center</a>
              <a href="#" className="hover:text-gray-700">Privacy & Terms</a>
              <a href="#" className="hover:text-gray-700">Ad Choices</a>
              <a href="#" className="hover:text-gray-700">Advertising</a>
              <a href="#" className="hover:text-gray-700">Business Services</a>
              <a href="#" className="hover:text-gray-700">Get the App</a>
              <a href="#" className="hover:text-gray-700">More</a>
            </div>
            <p className="text-xs text-gray-400 mt-4">Kendraa Corporation © 2025</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
          <div className="flex">
            <button
              onClick={() => setActiveTab('grow')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'grow'
                  ? 'bg-azure-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Grow
            </button>
            <button
              onClick={() => setActiveTab('catch-up')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'catch-up'
                  ? 'bg-azure-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Catch up
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'grow' && (
          <div className="space-y-6">
            {/* Invitations Section */}
            {connectionRequests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Invitations ({connectionRequests.length})</h3>
                  <button className="text-sm text-azure-600 hover:text-azure-700 font-medium">
                    Show all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {connectionRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={request.requester.avatar_url}
                          alt={request.requester.full_name || 'User'}
                          size="md"
                        />
                        <div>
                          <ClickableProfileName
                            userId={request.requester.id}
                            name={request.requester.full_name || 'Anonymous User'}
                            userType={request.requester.profile_type}
                            className="text-sm font-semibold text-gray-900"
                          />
                          <p className="text-xs text-gray-600">
                            {request.requester.headline || 'Healthcare Professional'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Follows you and is inviting you to connect
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors text-sm font-medium"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Puzzle Game Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <PuzzlePieceIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Zip - a quick brain teaser</h4>
                    <p className="text-xs text-gray-600">Solve in 60s or less!</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                  Solve now
                </button>
              </div>
            </div>

            {/* People you may know Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  People in the Healthcare industry you may know
                </h3>
                <button className="text-sm text-azure-600 hover:text-azure-700 font-medium">
                  Show all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredSuggestions.slice(0, 8).map((profile) => (
                  <div key={profile.id} className="relative bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    
                    <div className="text-center">
                      <Avatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        size="md"
                        className="mx-auto mb-3"
                      />
                      <ClickableProfileName
                        userId={profile.id}
                        name={profile.full_name || 'Anonymous User'}
                        userType={profile.profile_type}
                        className="text-sm font-semibold text-gray-900 mb-1"
                      />
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {profile.headline || 'Healthcare Professional'}
                      </p>
                      
                      {profile.mutual_connections && profile.mutual_connections > 0 ? (
                        <p className="text-xs text-gray-500 mb-3">
                          {`${profile.mutual_connections} mutual connection${profile.mutual_connections !== 1 ? 's' : ''}`}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mb-3">Based on your profile</p>
                      )}
                      
                      <button
                        onClick={() => handleConnect(profile.id, profile.profile_type as 'individual' | 'institution')}
                        disabled={profile.connection_status === 'pending' || profile.connection_status === 'connected'}
                        className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                          profile.connection_status === 'connected'
                            ? 'bg-green-100 text-green-700'
                            : profile.connection_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-azure-500 text-white hover:bg-azure-600'
                        }`}
                      >
                        {profile.connection_status === 'connected' ? 'Connected' : 
                         profile.connection_status === 'pending' ? 'Pending' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution-specific Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  People you may know from Healthcare Institutions
                </h3>
                <button className="text-sm text-azure-600 hover:text-azure-700 font-medium">
                  Show all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredSuggestions
                  .filter(p => p.profile_type === 'institution')
                  .slice(0, 4)
                  .map((profile) => (
                  <div key={profile.id} className="relative bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    
                    <div className="text-center">
                      <Avatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Institution'}
                        size="md"
                        className="mx-auto mb-3"
                      />
                      <ClickableProfileName
                        userId={profile.id}
                        name={profile.full_name || 'Healthcare Institution'}
                        userType={profile.profile_type}
                        className="text-sm font-semibold text-gray-900 mb-1"
                      />
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {profile.headline || 'Healthcare Institution'}
                      </p>
                      
                      {profile.mutual_connections && profile.mutual_connections > 0 ? (
                        <p className="text-xs text-gray-500 mb-3">
                          {`${profile.mutual_connections} mutual connection${profile.mutual_connections !== 1 ? 's' : ''}`}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mb-3">Based on your profile</p>
                      )}
                      
                      <button
                        onClick={() => handleConnect(profile.id, 'institution')}
                        disabled={profile.follow_status === 'following'}
                        className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                          profile.follow_status === 'following'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-azure-500 text-white hover:bg-azure-600'
                        }`}
                      >
                        {profile.follow_status === 'following' ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catch-up' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Catch up with your network</h3>
              <p className="text-gray-600">
                Stay updated with your connections&apos; activities and recent posts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 