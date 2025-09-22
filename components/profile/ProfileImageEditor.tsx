'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  PhotoIcon,
  XMarkIcon,
  CameraIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { uploadProfileImage } from '@/lib/vercel-blob';
import { validateFile, generateFilePath } from '@/lib/utils';

interface ProfileImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentAvatar?: string | null;
  currentBanner?: string | null;
}

export default function ProfileImageEditor({ 
  isOpen, 
  onClose, 
  onUpdate, 
  currentAvatar, 
  currentBanner 
}: ProfileImageEditorProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'avatar' | 'banner'>('avatar');
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar || null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  
  // Banner state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentBanner || null);
  const [bannerLoading, setBannerLoading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSizeMB = type === 'avatar' ? 2 : 5; // 2MB for avatar, 5MB for banner
    const validation = validateFile(file, maxSizeMB);

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(reader.result as string);
      } else {
        setBannerFile(file);
        setBannerPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async (type: 'avatar' | 'banner') => {
    if (!user?.id) return;

    const isAvatar = type === 'avatar';
    const currentUrl = isAvatar ? currentAvatar : currentBanner;
    
    if (!currentUrl) {
      // Just clear the preview if no current image
      if (isAvatar) {
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        setBannerFile(null);
        setBannerPreview(null);
      }
      return;
    }

    try {
      // Delete from Supabase storage
      const path = currentUrl.split('/').pop();
      if (path) {
        const bucket = type === 'avatar' ? 'avatars' : 'banners';
        const folder = type === 'avatar' ? 'avatars' : 'banners';
        // Note: Vercel Blob doesn't support client-side deletion
        // const result = await deleteFromSupabaseStorage(bucket, `${folder}/${path}`);
        
        // if (result.error) {
        //   throw new Error(result.error);
        // }
      }

      // Update profile
      await updateProfile({
        [type === 'avatar' ? 'avatar_url' : 'banner_url']: null,
      });

      // Clear state
      if (isAvatar) {
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        setBannerFile(null);
        setBannerPreview(null);
      }

      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} removed successfully`);
      onUpdate();
    } catch (error) {
      toast.error(`Failed to remove ${type === 'avatar' ? 'profile picture' : 'cover photo'}`);
    }
  };

  const handleSaveImage = async (type: 'avatar' | 'banner') => {
    if (!user?.id) return;

    const file = type === 'avatar' ? avatarFile : bannerFile;
    if (!file) return;

    const isAvatar = type === 'avatar';
    const setLoadingState = isAvatar ? setAvatarLoading : setBannerLoading;

    setLoadingState(true);
    try {
      // Generate file path
      const folder = isAvatar ? 'avatars' : 'banners';
      const filePath = generateFilePath(user.id, file.name);

      // Upload to Vercel Blob
      const result = await uploadProfileImage(file, user.id);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update profile
      await updateProfile({
        [isAvatar ? 'avatar_url' : 'banner_url']: result.url,
      });

      // Clear file state but keep preview
      if (isAvatar) {
        setAvatarFile(null);
      } else {
        setBannerFile(null);
      }

      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully`);
      onUpdate();
    } catch (error) {
      toast.error(`Failed to save ${type === 'avatar' ? 'profile picture' : 'cover photo'}`);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      let avatarUrl = currentAvatar;
      let bannerUrl = currentBanner;

      // Upload avatar if changed
      if (avatarFile) {
        const filePath = generateFilePath(user.id, avatarFile.name);
        const result = await uploadProfileImage(avatarFile, user.id);
        if (result.error) {
          throw new Error(result.error);
        }
        avatarUrl = result.url;
      }

      // Upload banner if changed
      if (bannerFile) {
        const filePath = generateFilePath(user.id, bannerFile.name);
        const result = await uploadProfileImage(bannerFile, user.id);
        if (result.error) {
          throw new Error(result.error);
        }
        bannerUrl = result.url;
      }

      // Update profile
      await updateProfile({
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });

      // Clear file states
      setAvatarFile(null);
      setBannerFile(null);

      toast.success('Profile images updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to save images');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = avatarFile || bannerFile;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile Images</h2>
                  <p className="text-sm text-gray-600">Update your profile picture and cover photo</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('avatar')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'avatar'
                      ? 'bg-white text-azure-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Profile Picture
                </button>
                <button
                  onClick={() => setActiveTab('banner')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'banner'
                      ? 'bg-white text-azure-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cover Photo
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'avatar' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                    <div className="flex items-center space-x-6">
                      {/* Current/Preview Image */}
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                          {avatarPreview ? (
                            <Image
                              src={avatarPreview}
                              alt="Profile picture"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PhotoIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Upload Overlay */}
                        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                          <CameraIcon className="w-6 h-6 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'avatar')}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Actions */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload new photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'avatar')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-azure-50 file:text-azure-700 hover:file:bg-azure-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG or WebP. Max 2MB. Square image recommended.
                          </p>
                        </div>

                        <div className="flex space-x-3">
                          {avatarFile && (
                            <button
                              onClick={() => handleSaveImage('avatar')}
                              disabled={avatarLoading}
                              className="flex items-center space-x-2 px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {avatarLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckIcon className="w-4 h-4" />
                              )}
                              <span>Save</span>
                            </button>
                          )}

                          {avatarPreview && (
                            <button
                              onClick={() => handleRemoveImage('avatar')}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Photo</h3>
                    
                    {/* Current/Preview Image */}
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                      {bannerPreview ? (
                        <Image
                          src={bannerPreview}
                          alt="Cover photo"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PhotoIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Upload Overlay */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-center text-white">
                          <CameraIcon className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm">Click to upload</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, 'banner')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Upload Input */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload new cover photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'banner')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-azure-50 file:text-azure-700 hover:file:bg-azure-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or WebP. Max 5MB. 1920x1080 recommended.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {bannerFile && (
                        <button
                          onClick={() => handleSaveImage('banner')}
                          disabled={bannerLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {bannerLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckIcon className="w-4 h-4" />
                          )}
                          <span>Save</span>
                        </button>
                      )}

                      {bannerPreview && (
                        <button
                          onClick={() => handleRemoveImage('banner')}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {hasChanges && (
                  <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="px-6 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save All Changes'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
