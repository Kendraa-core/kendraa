'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  UserPlusIcon,
  EnvelopeIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  getSuggestedConnections, 
  getConnectionRequests, 
  getConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionStatus
} from '@/lib/queries';
import type { Profile, ConnectionWithProfile } from '@/types/database.types';

interface ProfilePreview extends Profile {
  mutual_connections?: number;
  connection_status?: 'none' | 'pending' | 'connected';
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProfilePreview[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'connections'>('suggestions');

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[NetworkPage] ${message}`, data);
  };

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    debugLog('Fetching network data', { userId: user.id });
    
    try {
      const [suggestionsData, requestsData, connectionsData] = await Promise.all([
        getSuggestedConnections(user.id, 12),
        getConnectionRequests(user.id),
        getConnections(user.id)
      ]);

      debugLog('Network data fetched', { 
        suggestions: suggestionsData.length,
        requests: requestsData.length,
        connections: connectionsData.length 
      });

      // Add connection status to suggestions
      const enrichedSuggestions = await Promise.all(
        suggestionsData.map(async (profile) => {
          const status = await getConnectionStatus(user.id, profile.id);
          return {
            ...profile,
            connection_status: (status as 'none' | 'pending' | 'connected') || 'none',
            mutual_connections: Math.floor(Math.random() * 20) + 1, // Mock for demo
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

  const handleConnect = async (profileId: string) => {
    if (!user?.id) return;
    
    debugLog('Sending connection request', { fromUserId: user.id, toUserId: profileId });
    
    try {
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
    } catch (error) {
      debugLog('Error sending connection request', error);
      toast.error('Failed to send connection request');
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

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', count: suggestions.length },
    { id: 'requests', label: 'Invitations', count: connectionRequests.length },
    { id: 'connections', label: 'Connections', count: connections.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="modern-card animate-pulse">
            <div className="p-8">
              <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div
          
          
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Network</h1>
          <p className="text-slate-600">Manage your professional connections</p>
        </div>

        {/* Search */}
        <div
          
          
          
          className="mb-8"
        >
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div
          
          
          
          className="mb-8"
        >
          <Card className="modern-card">
            <CardContent className="p-0">
              <div className="border-b border-slate-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'suggestions' | 'requests' | 'connections')}
                      className={cn(
                        'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      )}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={cn(
                          'ml-2 py-0.5 px-2 rounded-full text-xs',
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-slate-100 text-slate-600'
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div
          
          
          
        >
          {activeTab === 'suggestions' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">People you may know</h2>
              {filteredSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      
                      
                      
                      className="modern-card hover:shadow-modern-lg transition-shadow duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Avatar
                            src={suggestion.avatar_url}
                            alt={suggestion.full_name || 'User'}
                            size="xl"
                            className="mx-auto mb-4"
                          />
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {suggestion.full_name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {suggestion.headline}
                          </p>
                          {suggestion.mutual_connections && (
                            <p className="text-xs text-slate-500 mb-4">
                              {suggestion.mutual_connections} mutual connections
                            </p>
                          )}
                          
                          <div className="space-y-2">
                            {suggestion.connection_status === 'none' ? (
                              <Button
                                onClick={() => handleConnect(suggestion.id)}
                                className="modern-button-primary w-full"
                                size="sm"
                              >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            ) : suggestion.connection_status === 'pending' ? (
                              <Button
                                disabled
                                variant="outline"
                                className="w-full"
                                size="sm"
                              >
                                Request Sent
                              </Button>
                            ) : (
                              <Button
                                disabled
                                variant="outline"
                                className="w-full"
                                size="sm"
                              >
                                <CheckIcon className="w-4 h-4 mr-2" />
                                Connected
                              </Button>
                            )}
                            
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 text-slate-600 hover:text-primary-600"
                              >
                                <EnvelopeIcon className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                              <Link href={`/profile/${suggestion.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 text-slate-600 hover:text-primary-600"
                                >
                                  <LinkIcon className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="modern-card">
                  <CardContent className="p-12 text-center">
                    <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No suggestions found</h3>
                    <p className="text-slate-500">Try adjusting your search criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Connection Requests</h2>
              {connectionRequests.length > 0 ? (
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <div
                      key={request.id}
                      
                      
                      className="modern-card"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar
                              src={request.requester.avatar_url}
                              alt={request.requester.full_name || 'User'}
                              size="lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900">
                                {request.requester.full_name}
                              </h3>
                              <p className="text-sm text-slate-600 truncate">
                                {request.requester.headline}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Sent {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="modern-button-primary"
                              size="sm"
                            >
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="modern-card">
                  <CardContent className="p-12 text-center">
                    <UserPlusIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No pending requests</h3>
                    <p className="text-slate-500">When people send you connection requests, they&apos;ll appear here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Connections</h2>
              {connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      
                      
                      className="modern-card hover:shadow-modern-lg transition-shadow duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Avatar
                            src={connection.avatar_url}
                            alt={connection.full_name || 'User'}
                            size="xl"
                            className="mx-auto mb-4"
                          />
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {connection.full_name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {connection.headline}
                          </p>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <EnvelopeIcon className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                                                         <Link href={`/profile/${connection.id}`}>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="flex-1"
                               >
                                 <LinkIcon className="w-4 h-4 mr-1" />
                                 View
                               </Button>
                             </Link>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="modern-card">
                  <CardContent className="p-12 text-center">
                    <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No connections yet</h3>
                    <p className="text-slate-500">Start connecting with people you know to build your network.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 