'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/queries';

interface ConnectionButtonProps {
  profileId: string;
  onStatusChange?: () => void;
}

export default function ConnectionButton({ profileId, onStatusChange }: ConnectionButtonProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loading, setLoading] = useState(false);

  const fetchConnectionStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await getSupabase()
        .from('connections')
        .select('status')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${profileId},recipient_id.eq.${profileId}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setStatus('none');
        } else {
          throw error;
        }
      } else if (data) {
        setStatus(data.status === 'accepted' ? 'connected' : 'pending');
      }
    } catch (error) {
      // Silent error handling for connection status
    }
  }, [user?.id, profileId]);

  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  const handleConnect = async () => {
    if (!user?.id || loading) return;

    setLoading(true);
    try {
      const { error } = await getSupabase()
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: profileId,
          status: 'pending',
        });

      if (error) throw error;

      setStatus('pending');
      onStatusChange?.();
    } catch (error) {
      // Silent error handling for connection request
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!user?.id || loading) return;

    setLoading(true);
    try {
      const { error } = await getSupabase()
        .from('connections')
        .delete()
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`requester_id.eq.${profileId},recipient_id.eq.${profileId}`);

      if (error) throw error;

      setStatus('none');
      onStatusChange?.();
    } catch (error) {
      // Silent error handling for connection removal
    } finally {
      setLoading(false);
    }
  };

  if (user?.id === profileId) return null;

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      {status === 'none' && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="px-4 py-2 bg-[#007fff] text-white rounded-full hover:bg-[#007fff]/90 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      )}

      {status === 'pending' && (
        <button
          onClick={handleRemoveConnection}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Canceling...' : 'Pending'}
        </button>
      )}

      {status === 'connected' && (
        <button
          onClick={handleRemoveConnection}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Removing...' : 'Connected'}
        </button>
      )}
    </motion.div>
  );
} 