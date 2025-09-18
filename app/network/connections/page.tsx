'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  UserIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { 
  getConnections,
  getConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionCount
} from '@/lib/queries';
import { Profile, ConnectionWithProfile } from '@/types/database.types';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS
} from '@/lib/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [connections, setConnections] = useState<Profile[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');

  const fetchConnectionsData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const [connectionsData, requestsData, countData] = await Promise.all([
        getConnections(user.id),
        getConnectionRequests(user.id),
        getConnectionCount(user.id)
      ]);

      setConnections(connectionsData);
      setConnectionRequests(requestsData);
      setConnectionCount(countData);
    } catch (error) {
      toast.error('Failed to load connections data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConnectionsData();
  }, [fetchConnectionsData]);

  const handleAcceptConnection = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await acceptConnectionRequest(requestId);
      if (success) {
        setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
        setConnectionCount(prev => prev + 1);
        toast.success('Connection accepted!');
        fetchConnectionsData();
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
      } else {
        toast.error('Failed to decline connection');
      }
    } catch (error) {
      toast.error('Failed to decline connection');
    }
  };

  // Filter connections based on search
  const filteredConnections = connections.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your connections</p>
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
    return <LoadingSpinner  text="Loading connections..." />;
  }

  return (
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className={`${TYPOGRAPHY.heading.h1}`}>My Connections</h1>
              <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                {connectionCount} connections
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'connections'
                  ? 'bg-white text-[#007fff] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connections ({connectionCount})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-white text-[#007fff] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Requests ({connectionRequests.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className={`${COMPONENTS.card.base} mb-6`}>
            <div className="p-4">
              <div className="relative">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${TEXT_COLORS.secondary}`} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'connections' ? 'connections' : 'requests'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${COMPONENTS.input.base} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'connections' ? (
            <div className="space-y-4">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((connection) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${COMPONENTS.card.base}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar
                          src={connection.avatar_url}
                          alt={connection.full_name || 'User'}
                          size="lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`${TYPOGRAPHY.body.medium} font-semibold`}>
                              {connection.full_name}
                            </h3>
                            {connection.user_type === 'institution' && (
                              <CheckIcon className="w-4 h-4 text-[#007fff]" />
                            )}
                          </div>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2`}>
                            {connection.headline || 'Healthcare Professional'}
                          </p>
                          {connection.location && (
                            <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} flex items-center`}>
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {connection.location}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/profile/${connection.id}`}
                          className={`px-4 py-2 ${COMPONENTS.button.primary} text-sm font-medium`}
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`${COMPONENTS.card.base} text-center py-12`}>
                  <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>No connections found</h3>
                  <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                    {searchQuery ? 'Try adjusting your search terms' : 'Start connecting with healthcare professionals'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {connectionRequests.length > 0 ? (
                connectionRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${COMPONENTS.card.base}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar
                          src={request.requester.avatar_url}
                          alt={request.requester.full_name || 'User'}
                          size="lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`${TYPOGRAPHY.body.medium} font-semibold`}>
                              {request.requester.full_name}
                            </h3>
                            {request.requester.user_type === 'institution' && (
                              <CheckIcon className="w-4 h-4 text-[#007fff]" />
                            )}
                          </div>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2`}>
                            {request.requester.headline || 'Healthcare Professional'}
                          </p>
                          {request.requester.location && (
                            <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} flex items-center mb-3`}>
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {request.requester.location}
                            </p>
                          )}
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                            Wants to connect with you
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
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`${COMPONENTS.card.base} text-center py-12`}>
                  <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>No pending requests</h3>
                  <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                    You have no pending connection requests
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
