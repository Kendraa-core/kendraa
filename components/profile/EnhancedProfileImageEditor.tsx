'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  PhotoIcon,
  XMarkIcon,
  CameraIcon,
  TrashIcon,
  CheckIcon,
  ArrowPathIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { validateFile, uploadToSupabaseStorage, deleteFromSupabaseStorage, generateFilePath } from '@/lib/utils';
import { updateProfile } from '@/lib/queries';

interface ProfileImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentAvatar?: string | null;
  currentBanner?: string | null;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function EnhancedProfileImageEditor({ 
  isOpen, 
  onClose, 
  onUpdate, 
  currentAvatar, 
  currentBanner 
}: ProfileImageEditorProps) {
  
  const { user } = useAuth();
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

  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const outputSize = cropType === 'avatar' ? 400 : 1600;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    if (cropType === 'avatar') {
      canvas.width = outputSize;
      canvas.height = outputSize;
    } else {
      canvas.width = outputSize;
      canvas.height = Math.round(outputSize * 9 / 16);
    }

    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    const sx = pixelCrop.x;
    const sy = pixelCrop.y;
    const sWidth = pixelCrop.width;
    const sHeight = pixelCrop.height;

    ctx.drawImage(
      image,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas is empty'));
        resolve(blob);
      }, 'image/jpeg', 0.92);
    });
  };


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = type === 'avatar' ? 5 : 10;
    const validation = validateFile(file, maxSizeMB);

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropType(type);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      setLoading(true);
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels, rotation);
      const ext = 'jpg';
      const filename = `${user?.id || 'anon'}-${cropType}-${Date.now()}.${ext}`;
      const file = new File([croppedImageBlob], filename, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(croppedImageBlob);

      if (cropType === 'avatar') {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
      } else {
        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBannerFile(file);
        setBannerPreview(previewUrl);
      }

      setShowCropper(false);
      setImageToCrop(null);
      toast.success('Image cropped successfully!');
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image');
    } finally {
      setLoading(false);
    }
  };


  const handleRemoveImage = async (type: 'avatar' | 'banner') => {
    if (!user?.id) return;

    const currentUrl = type === 'avatar' ? currentAvatar : currentBanner;
    if (!currentUrl) return;

    const isAvatar = type === 'avatar';
    const setLoadingState = isAvatar ? setAvatarLoading : setBannerLoading;

    setLoadingState(true);
    try {
      const bucket = isAvatar ? 'avatars' : 'banners';
      // The path is everything after the bucket name in the URL
      const path = currentUrl.split(`/${bucket}/`)[1];
      
      if (!path) {
        throw new Error("Could not extract file path from URL.");
      }

      await deleteFromSupabaseStorage(bucket, path);

      await updateProfile(user.id, {
        [isAvatar ? 'avatar_url' : 'banner_url']: null,
      });

      if (isAvatar) {
        setAvatarPreview(null);
        setAvatarFile(null);
      } else {
        setBannerPreview(null);
        setBannerFile(null);
      }

      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} removed successfully`);
      onUpdate();
    } catch (error: any) {
      console.error(`Failed to remove image:`, error);
      toast.error(`Failed to remove ${type === 'avatar' ? 'profile picture' : 'cover photo'}: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSaveImage = async (type: 'avatar' | 'banner') => {
    if (!user?.id) return toast.error('User not found');

    const file = type === 'avatar' ? avatarFile : bannerFile;
    if (!file) return toast.error('No file to upload');

    const isAvatar = type === 'avatar';
    const setLoadingState = isAvatar ? setAvatarLoading : setBannerLoading;
    setLoadingState(true);

    try {
      const folder = isAvatar ? 'avatars' : 'banners';
      // Use the corrected generateFilePath function
      const filePath = generateFilePath(user.id, file.name);
      
      const result = await uploadToSupabaseStorage(folder, filePath, file);

      if (result.error) {
        // The error object from Supabase might have a 'message' property
        const errorMessage = result.error.message || String(result.error);
        throw new Error(errorMessage);
      }
      
      const uploadedUrl = result.url;
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no URL was returned.');
      }
      
      await updateProfile(user.id, {
        [isAvatar ? 'avatar_url' : 'banner_url']: uploadedUrl,
      });

      if (isAvatar) setAvatarFile(null);
      else setBannerFile(null);

      toast.success(`${isAvatar ? 'Profile picture' : 'Cover photo'} updated successfully`);
      onUpdate();
    } catch (err: any) {
      console.error(`[handleSaveImage Error]`, err);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id) return toast.error('User not found');

    setLoading(true);
    try {
      const updates: { avatar_url?: string; banner_url?: string } = {};

      if (avatarFile) {
        const result = await uploadToSupabaseStorage(
          'avatars',
          generateFilePath(user.id, avatarFile.name),
          avatarFile
        );
        const errorMessage = result.error?.message || result.error;
        if (errorMessage) throw new Error(`Avatar upload failed: ${errorMessage}`);
        if (!result.url) throw new Error('Avatar upload succeeded but no URL was returned.');
        updates.avatar_url = result.url;
      }

      if (bannerFile) {
        const result = await uploadToSupabaseStorage(
          'banners',
          generateFilePath(user.id, bannerFile.name),
          bannerFile
        );
        const errorMessage = result.error?.message || result.error;
        if (errorMessage) throw new Error(`Banner upload failed: ${errorMessage}`);
        if (!result.url) throw new Error('Banner upload succeeded but no URL was returned.');
        updates.banner_url = result.url;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(user.id, updates);
      }

      setAvatarFile(null);
      setBannerFile(null);

      toast.success('Profile images updated successfully');
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('[handleSaveAll] failed', err);
      toast.error(`Failed to save images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetCropSettings = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-[#007fff]/10 rounded-lg">
                <CameraIcon className="w-6 h-6 text-[#007fff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Profile Images</h2>
                <p className="text-sm text-gray-600">Upload, crop, and adjust your profile images</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {showCropper ? (
              /* Cropper Interface */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Crop Your {cropType === 'avatar' ? 'Profile Picture' : 'Cover Photo'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Drag to move, scroll to zoom, and adjust the crop area
                  </p>
                </div>

                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <Cropper
                    image={imageToCrop || ''}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={cropType === 'avatar' ? 1 : 16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    showGrid={true}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zoom: {Math.round(zoom * 100)}%
                    </label>
                    <div className="flex items-center space-x-4">
                      <MagnifyingGlassMinusIcon className="w-5 h-5 text-gray-400" />
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <MagnifyingGlassPlusIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rotation: {rotation}°
                    </label>
                    <div className="flex items-center space-x-4">
                      <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={resetCropSettings}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowCropper(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    onClick={handleCropSave}
                    disabled={loading}
                    className="px-6 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    <span>Apply Crop</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Main Editor Interface */
              <div className="space-y-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('avatar')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'avatar'
                        ? 'bg-white text-[#007fff] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Profile Picture
                  </button>
                  <button
                    onClick={() => setActiveTab('banner')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'banner'
                        ? 'bg-white text-[#007fff] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cover Photo
                  </button>
                </div>

                {activeTab === 'avatar' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
                      <p className="text-sm text-gray-600">
                        Upload a square image. We&apos;ll help you crop it perfectly.
                      </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        {avatarPreview ? (
                          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#007fff]/20">
                            <Image
                              src={avatarPreview}
                              alt="Avatar preview"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-[#007fff]/10 flex items-center justify-center border-4 border-[#007fff]/20">
                            <PhotoIcon className="w-16 h-16 text-[#007fff]/40" />
                          </div>
                        )}
                        <label className="absolute -bottom-1 -right-1 bg-[#007fff] text-white p-2 rounded-full hover:bg-[#007fff]/90 transition-colors cursor-pointer">
                          <CameraIcon className="w-4 h-4" />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'avatar')}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <label className="cursor-pointer">
                          <span className="px-6 py-3 bg-[#007fff]/10 text-[#007fff] rounded-xl hover:bg-[#007fff]/20 transition-colors font-medium">
                            {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                          </span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'avatar')}
                            className="hidden"
                          />
                        </label>
                        {avatarPreview && (
                          <button
                            onClick={() => handleRemoveImage('avatar')}
                            disabled={avatarLoading}
                            className="px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50"
                          >
                            {avatarLoading ? 'Removing...' : 'Remove'}
                          </button>
                        )}
                      </div>

                      {avatarFile && (
                        <button
                          onClick={() => handleSaveImage('avatar')}
                          disabled={avatarLoading}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
                        >
                          {avatarLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckIcon className="w-4 h-4" />
                          )}
                          <span>Save Profile Picture</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'banner' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Cover Photo</h3>
                      <p className="text-sm text-gray-600">
                        Upload a wide image. We&apos;ll help you crop it to the perfect size.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {bannerPreview ? (
                          <Image
                            src={bannerPreview}
                            alt="Banner preview"
                            layout="fill"
                            objectFit="cover"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PhotoIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3 justify-center">
                        <label className="cursor-pointer">
                          <span className="px-6 py-3 bg-[#007fff]/10 text-[#007fff] rounded-xl hover:bg-[#007fff]/20 transition-colors font-medium">
                            {bannerPreview ? 'Change Photo' : 'Upload Photo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'banner')}
                            className="hidden"
                          />
                        </label>
                        {bannerPreview && (
                          <button
                            onClick={() => handleRemoveImage('banner')}
                            disabled={bannerLoading}
                            className="px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50"
                          >
                            {bannerLoading ? 'Removing...' : 'Remove'}
                          </button>
                        )}
                      </div>

                      {bannerFile && (
                        <div className="text-center">
                          <button
                            onClick={() => handleSaveImage('banner')}
                            disabled={bannerLoading}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2 mx-auto"
                          >
                            {bannerLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )}
                            <span>Save Cover Photo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!showCropper && (
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {avatarFile || bannerFile ? 'You have unsaved changes' : 'All changes saved'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {(avatarFile || bannerFile) && (
                  <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="px-6 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    <span>Save All Changes</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
