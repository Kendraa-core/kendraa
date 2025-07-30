'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ConnectionButton from '@/components/profile/ConnectionButton';

interface ProfilePreview {
  id: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
}

interface ConnectionRequest {
  id: string;
  created_at: string;
  requester: ProfilePreview;
  recipient: ProfilePreview;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function NetworkPage() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<ProfilePreview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNetworkData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch pending requests
      const { data: pendingData, error: pendingError } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          status,
          requester:profiles!connections_requester_id_fkey (
            id,
            full_name,
            avatar_url,
            headline,
            location
          ),
          recipient:profiles!connections_recipient_id_fkey (
            id,
            full_name,
            avatar_url,
            headline,
            location
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch accepted connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          id,
          requester_id,
          recipient_id,
          requester:profiles!connections_requester_id_fkey (
            id,
            full_name,
            avatar_url,
            headline,
            location
          ),
          recipient:profiles!connections_recipient_id_fkey (
            id,
            full_name,
            avatar_url,
            headline,
            location
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Transform the data to match our types
      const transformedPendingData = (pendingData || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        status: item.status,
        requester: {
          id: item.requester[0].id,
          full_name: item.requester[0].full_name,
          avatar_url: item.requester[0].avatar_url,
          headline: item.requester[0].headline,
          location: item.requester[0].location,
        },
        recipient: {
          id: item.recipient[0].id,
          full_name: item.recipient[0].full_name,
          avatar_url: item.recipient[0].avatar_url,
          headline: item.recipient[0].headline,
          location: item.recipient[0].location,
        },
      }));

      setPendingRequests(transformedPendingData);

      // Transform and process connections
      const transformedConnectionsData = (connectionsData || []).map(item => ({
        id: item.id,
        requester_id: item.requester_id,
        recipient_id: item.recipient_id,
        requester: {
          id: item.requester[0].id,
          full_name: item.requester[0].full_name,
          avatar_url: item.requester[0].avatar_url,
          headline: item.requester[0].headline,
          location: item.requester[0].location,
        },
        recipient: {
          id: item.recipient[0].id,
          full_name: item.recipient[0].full_name,
          avatar_url: item.recipient[0].avatar_url,
          headline: item.recipient[0].headline,
          location: item.recipient[0].location,
        },
      }));

      // Get unique profiles from connections
      const connectionProfiles = transformedConnectionsData.map(conn => {
        return conn.requester_id === user.id ? conn.recipient : conn.requester;
      });

      setConnections(connectionProfiles);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchNetworkData();
  }, [user?.id, fetchNetworkData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-6">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link href={`/profile/${request.requester.id}`} className="flex-shrink-0">
                      {request.requester.avatar_url ? (
                        <Image
                          src={request.requester.avatar_url}
                          alt={request.requester.full_name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                      )}
                    </Link>
                    <div>
                      <Link
                        href={`/profile/${request.requester.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {request.requester.full_name}
                      </Link>
                      {request.requester.headline && (
                        <p className="text-sm text-gray-500">{request.requester.headline}</p>
                      )}
                    </div>
                  </div>
                  <ConnectionButton
                    profileId={request.requester.id}
                    onStatusChange={fetchNetworkData}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Your Connections ({connections.length})
          </h2>
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((connection) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-4"
                >
                  <Link href={`/profile/${connection.id}`} className="flex-shrink-0">
                    {connection.avatar_url ? (
                      <Image
                        src={connection.avatar_url}
                        alt={connection.full_name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${connection.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {connection.full_name}
                    </Link>
                    {connection.headline && (
                      <p className="text-sm text-gray-500 truncate">{connection.headline}</p>
                    )}
                    {connection.location && (
                      <p className="text-xs text-gray-400">{connection.location}</p>
                    )}
                  </div>
                  <ConnectionButton
                    profileId={connection.id}
                    onStatusChange={fetchNetworkData}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              You have not connected with anyone yet.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
} 