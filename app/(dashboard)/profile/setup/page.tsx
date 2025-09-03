'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/queries';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { UserCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

export default function ProfileSetupPage() {
  const { user, profile: authProfile, updateProfile: updateAuthProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Function to handle file uploads
  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!user) {
      toast.error('You must be logged in to upload images.');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    // Create a user-specific folder path, required by our security policies
    const filePath = `${user.id}/${fileName}`; 

    try {
      // Upload the file to the 'avatars' bucket
      const { error: uploadError } = await getSupabase().storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = getSupabase().storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded image.');
      }

      // Prepare the update object for the user's profile
      const updates = type === 'avatar' 
        ? { avatar_url: publicUrl, updated_at: new Date().toISOString() }
        : { banner_url: publicUrl, updated_at: new Date().toISOString() };

      // Update the user's profile in the 'profiles' table
      const { error: updateError } = await getSupabase()
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
      
      // Update local and global context state to reflect the change immediately
      const updatedProfile = { ...profile, ...updates } as Profile;
      setProfile(updatedProfile);
      updateAuthProfile(updates);

      toast.success(`${type === 'avatar' ? 'Profile photo' : 'Cover photo'} updated successfully!`);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Prefer profile from auth context if available, otherwise fetch
    if (authProfile) {
        setProfile(authProfile);
        setLoading(false);
    } else if (user) {
      fetchProfile();
    }
  }, [user, authProfile, fetchProfile]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Help others understand who you are by adding more information to your profile.
          </p>

          <div className="mt-8 space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || ''}
                      width={96}
                      height={96}
                      className="rounded-full object-cover"
                      key={profile.avatar_url} // Add key to force re-render on change
                    />
                  ) : (
                    <UserCircleIcon className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Change photo'}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], 'avatar');
                    }
                  }}
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg relative hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}
              >
                {profile.banner_url ? (
                  <div className="w-full aspect-[3/1] relative">
                    <Image
                      src={profile.banner_url}
                      alt="Cover"
                      fill
                      className="rounded-lg object-cover"
                      key={profile.banner_url}
                    />
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="text-gray-600">
                      <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm mt-2">Upload a cover photo</p>
                    </div>
                  </div>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                   onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], 'banner');
                    }
                  }}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  defaultValue={profile.full_name || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  defaultValue={profile.headline || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  defaultValue={profile.location || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  About
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  defaultValue={profile.bio || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

