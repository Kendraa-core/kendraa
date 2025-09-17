'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getConnections, 
  getConnectionRequests, 
  acceptConnectionRequest,
  rejectConnectionRequest,
  getInstitutionByUserId
} from '@/lib/queries';
import type { ConnectionWithProfile, Institution } from '@/types/database.types';
import { 
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Avatar from '@/components/common/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function InstitutionNetworkPage() {
  const { user, profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'suggestions'>('connections');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByUserId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [connectionsData, requestsData] = await Promise.all([
        getConnections(user.id),
        getConnectionRequests(user.id)
      ]);

      setConnections(connectionsData as unknown as ConnectionWithProfile[]);
      setConnectionRequests(requestsData as unknown as ConnectionWithProfile[]);
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInstitution();
  }, [fetchInstitution]);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);


  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const success = await acceptConnectionRequest(connectionId);
      if (success) {
        toast.success('Connection request accepted');
        fetchNetworkData(); // Refresh data
      } else {
        toast.error('Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast.error('Failed to accept connection request');
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const success = await rejectConnectionRequest(connectionId);
      if (success) {
        toast.success('Connection request rejected');
        fetchNetworkData(); // Refresh data
      } else {
        toast.error('Failed to reject connection request');
      }
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      toast.error('Failed to reject connection request');
    }
  };

  const getFilteredData = () => {
    const data = activeTab === 'connections' ? connections : 
                 activeTab === 'requests' ? connectionRequests : suggestions;
    
    if (!searchQuery) return data;
    
    return data.filter(connection => 
      connection.requester?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.requester?.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.requester?.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.recipient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.recipient?.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.recipient?.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const tabs = [
    { id: 'connections', name: 'Connections', count: connections.length },
    { id: 'requests', name: 'Requests', count: connectionRequests.length },
    { id: 'suggestions', name: 'Suggestions', count: suggestions.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Network</h1>
              <p className="text-gray-600 mt-2">
                Connect with healthcare professionals and institutions
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold text-[#007fff]">{connections.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#007fff] text-[#007fff]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-[#007fff]/10 text-[#007fff]'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {getFilteredData().length > 0 ? (
            getFilteredData().map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar
                        src={connection.recipient?.avatar_url}
                        name={connection.recipient?.full_name || 'User'}
                        size="lg"
                      />
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {connection.recipient?.full_name}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {connection.recipient?.headline || 'Healthcare Professional'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            {connection.recipient?.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{connection.recipient.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Connected {formatRelativeTime(connection.created_at)}</span>
                            </div>
                          </div>
                          
                          {connection.recipient?.bio && (
                            <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                              {connection.recipient.bio}
                            </p>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {activeTab === 'requests' && (
                            <>
                              <Button
                                onClick={() => handleAcceptRequest(connection.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleRejectRequest(connection.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <XMarkIcon className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {activeTab === 'suggestions' && (
                            <div className="text-sm text-gray-500 italic">
                              View Profile
                            </div>
                          )}
                          
                          {activeTab === 'connections' && (
                            <Link href={`/profile/${connection.recipient?.id}`}>
                              <Button size="sm" variant="outline">
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View Profile
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'connections' && 'No connections yet'}
                {activeTab === 'requests' && 'No pending requests'}
                {activeTab === 'suggestions' && 'No suggestions available'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'connections' && 'Start connecting with healthcare professionals to build your network.'}
                {activeTab === 'requests' && 'Connection requests from other users will appear here.'}
                {activeTab === 'suggestions' && 'We\'ll suggest relevant connections based on your profile and interests.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
