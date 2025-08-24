'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/queries';
import {
  UserCircleIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Profile } from '@/types/database.types';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    phone: profile.phone || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.banner_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(reader.result as string);
        } else {
          setCoverFile(file);
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.banner_url;

      // Upload avatar if changed
      if (avatarFile) {
        const avatarExt = avatarFile.name.split('.').pop();
        const avatarPath = `avatars/${user.id}_${Date.now()}.${avatarExt}`;
        const { error: avatarError } = await getSupabase().storage
          .from('public')
          .upload(avatarPath, avatarFile);

        if (avatarError) {
          console.error('Avatar upload error:', avatarError);
          throw new Error('Failed to upload avatar image');
        }
        
        const { data: { publicUrl } } = getSupabase().storage
          .from('public')
          .getPublicUrl(avatarPath);
        avatarUrl = publicUrl;
      }

      // Upload cover if changed
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `covers/${user.id}_${Date.now()}.${coverExt}`;
        const { error: coverError } = await getSupabase().storage
          .from('public')
          .upload(coverPath, coverFile);

        if (coverError) {
          console.error('Cover upload error:', coverError);
          throw new Error('Failed to upload cover image');
        }
        
        const { data: { publicUrl } } = getSupabase().storage
          .from('public')
          .getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Update profile using AuthContext
      await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
        banner_url: coverUrl,
      });

      toast.success('Profile updated successfully!');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'cover')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Click to upload
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="relative w-32 h-32">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-full h-full text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'avatar')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded text-center">
                  Upload
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g. Senior Cardiologist at City Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g. https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
} 