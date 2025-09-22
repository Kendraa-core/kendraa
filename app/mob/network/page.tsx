'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { usePageRefresh } from '@/hooks/usePageRefresh';
import {
  getSuggestedConnectionsWithMutualCounts,
  getSuggestedInstitutions,
  getConnectionRequests,
  getConnections,
  sendConnectionRequest,
  followInstitution,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from '@/lib/queries';
import { Profile, ConnectionWithProfile } from '@/types/database.types';
import {
  UserPlusIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface ProfilePreview extends Profile {
  mutual_connections?: number;
  connection_status?: 'none' | 'pending' | 'connected';
  follow_status?: 'following' | 'not_following';
}

export default function MobileNetworkPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ProfilePreview[]>([]);
  const [individuals, setIndividuals] = useState<ProfilePreview[]>([]);
  const [institutions, setInstitutions] = useState<ProfilePreview[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'connections'>('suggestions');
  const [canSendRequests, setCanSendRequests] = useState(true);
  
  // Initialize page refresh hook
  usePageRefresh();

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

      setCanSendRequests(true);

      // Set separate state variables
      setIndividuals(individualsData);
      setInstitutions(institutionsData);
      
      // Combine individuals and institutions for backward compatibility
      const allSuggestions = [...individualsData, ...institutionsData];
      const uniqueSuggestions = allSuggestions.filter((profile, index, self) => 
        index === self.findIndex(p => p.id === profile.id)
      );

      setSuggestions(uniqueSuggestions);
      setConnectionRequests(requestsData);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error fetching network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  const handleConnect = async (profileId: string, profileType: 'individual' | 'institution') => {
    if (!user?.id || !canSendRequests) {
      toast.error('You cannot send connection requests');
      return;
    }
    
    try {
      let success = false;
      
      if (profileType === 'institution') {
        success = await followInstitution(user.id, profileId);
        if (success) {
          setSuggestions(prev => prev.map(p => 
            p.id === profileId ? { ...p, follow_status: 'following' } : p
          ));
          toast.success('Now following this institution!');
          
          // Dispatch event to trigger page refresh
          window.dispatchEvent(new CustomEvent('follow-status-updated', {
            detail: { targetUserId: profileId, targetUserType: 'institution' }
          }));
        }
      } else {
        const result = await sendConnectionRequest(user.id, profileId);
        success = !!result;
        if (success) {
          setSuggestions(prev => prev.map(p => 
            p.id === profileId ? { ...p, connection_status: 'pending' } : p
          ));
          toast.success('Connection request sent!');
          
          // Dispatch event to trigger page refresh
          window.dispatchEvent(new CustomEvent('connection-request-sent', {
            detail: { targetUserId: profileId, targetUserType: 'individual' }
          }));
        }
      }
      
      if (!success) {
        toast.error('Failed to complete action');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete action');
    }
  };

  const handleAcceptConnection = async (requestId: string) => {
    try {
      const success = await acceptConnectionRequest(requestId);
      if (success) {
        setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('Connection accepted!');
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
    try {
      const success = await rejectConnectionRequest(requestId);
      if (success) {
        setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('Connection request rejected');
        
        // Dispatch event to trigger page refresh
        window.dispatchEvent(new CustomEvent('connection-rejected', {
          detail: { requestId }
        }));
      } else {
        toast.error('Failed to reject connection');
      }
    } catch (error) {
      toast.error('Failed to reject connection');
    }
  };

  const renderSuggestions = () => (
    <div className="space-y-6">
      {/* Healthcare Institutions */}
      {institutions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Healthcare Institutions</h3>
          <div className="space-y-3">
            {institutions.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Institution'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.full_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {profile.headline || 'Healthcare Institution'}
                    </p>
                    {profile.location && (
                      <p className="text-xs text-gray-400 truncate">
                        📍 {profile.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                    {canSendRequests && (
                      <button
                        onClick={() => handleConnect(profile.id, 'institution')}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Healthcare Professionals */}
      {individuals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Healthcare Professionals</h3>
          <div className="space-y-3">
            {individuals.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.full_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {profile.headline || 'Healthcare Professional'}
                    </p>
                    {profile.mutual_connections && profile.mutual_connections > 0 && (
                      <p className="text-xs text-blue-600">
                        {profile.mutual_connections} mutual connection{profile.mutual_connections !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    {canSendRequests && (
                      <button
                        onClick={() => handleConnect(profile.id, 'individual')}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4">
      {connectionRequests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar
              src={request.requester?.avatar_url}
              alt={request.requester?.full_name || 'User'}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {request.requester?.full_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {request.requester?.headline || 'Healthcare Professional'}
              </p>
              <p className="text-xs text-gray-400">
                Wants to connect with you
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAcceptConnection(request.id)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRejectConnection(request.id)}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-4">
      {connections.map((connection) => (
        <Link
          key={connection.id}
          href={`/mob/profile/${connection.id}`}
          className="block bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Avatar
              src={connection.avatar_url}
              alt={connection.full_name || 'User'}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {connection.full_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {connection.headline || 'Healthcare Professional'}
              </p>
            </div>
            <div className="text-green-600">
              <CheckIcon className="w-5 h-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <MobileLayout title="Network">
      <div className="p-4">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Suggestions
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Requests
            {connectionRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {connectionRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'connections'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            My Network
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" text="Loading network..." />
          </div>
        ) : (
          <>
            {activeTab === 'suggestions' && renderSuggestions()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'connections' && renderConnections()}
          </>
        )}

        {/* Empty States */}
        {!loading && (
          <>
            {activeTab === 'suggestions' && individuals.length === 0 && institutions.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No suggestions available</p>
              </div>
            )}
            
            {activeTab === 'requests' && connectionRequests.length === 0 && (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending requests</p>
              </div>
            )}
            
            {activeTab === 'connections' && connections.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No connections yet</p>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  Find people to connect with
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}
