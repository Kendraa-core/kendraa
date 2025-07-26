'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ConnectionButton from '@/components/profile/ConnectionButton';
import OptimizedImage from '@/components/common/OptimizedImage';
import type { Profile } from '@/types/database.types';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      // Check if viewing own profile
      const isOwnProfile = user?.id === id;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          experiences (
            id,
            title,
            company,
            location,
            start_date,
            end_date,
            current,
            description
          ),
          education (
            id,
            school,
            degree,
            field,
            start_date,
            end_date,
            current,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);

      // If not viewing own profile, increment view count
      if (!isOwnProfile) {
        await supabase.rpc('increment_profile_views', { profile_id: id });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
      fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="-mt-16 relative z-10 px-4">
              <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
    }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover & Avatar */}
        <div className="relative">
          <div className="h-64 rounded-lg overflow-hidden">
            {profile.cover_url ? (
              <OptimizedImage
                src={profile.cover_url}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" />
            )}
            </div>
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white bg-white">
                {profile.avatar_url ? (
                  <OptimizedImage
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-r from-gray-100 to-gray-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
          {profile.headline && (
            <p className="mt-2 text-lg text-gray-600">{profile.headline}</p>
          )}
          {profile.location && (
            <p className="mt-1 text-gray-500">{profile.location}</p>
          )}

          {/* Connection Button */}
          <div className="mt-4">
            <ConnectionButton
              profileId={profile.id}
              onStatusChange={fetchProfile}
              />
            </div>
        </div>

        {/* About */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
          </motion.div>
        )}

        {/* Experience */}
        {profile.experiences && profile.experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
            <div className="space-y-6">
              {profile.experiences.map((experience) => (
                <div key={experience.id} className="flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg" />
                  <div>
                    <h3 className="font-medium text-gray-900">{experience.title}</h3>
                    <p className="text-gray-600">{experience.company}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(experience.start_date).toLocaleDateString()} -{' '}
                      {experience.current
                        ? 'Present'
                        : experience.end_date
                          ? new Date(experience.end_date).toLocaleDateString()
                          : 'Present'}
                    </p>
                    {experience.description && (
                      <p className="mt-2 text-gray-600">{experience.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
            <div className="space-y-6">
              {profile.education.map((edu) => (
                <div key={edu.id} className="flex gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg" />
          <div>
                    <h3 className="font-medium text-gray-900">{edu.school}</h3>
                    <p className="text-gray-600">
                      {edu.degree} • {edu.field}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(edu.start_date).toLocaleDateString()} -{' '}
                      {edu.current
                        ? 'Present'
                        : edu.end_date
                          ? new Date(edu.end_date).toLocaleDateString()
                          : 'Present'}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-gray-600">{edu.description}</p>
                )}
              </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 