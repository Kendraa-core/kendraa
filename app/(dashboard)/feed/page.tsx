'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfilePreview {
  id: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfilePreview | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          headline
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{profile.full_name}</h2>
                {profile.headline && (
                  <p className="text-sm text-gray-500">{profile.headline}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Feed Content */}
        <div className="space-y-8">
          {/* TODO: Add feed content */}
          <p className="text-center text-gray-500 py-8">Feed content coming soon...</p>
        </div>
      </div>
    </div>
  );
} 