'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PencilIcon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !content.trim()) return;

    setLoading(true);
    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
        });

      if (error) throw error;

      setContent('');
      setImage(null);
      setImagePreview(null);
      setShowModal(false);
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left px-4 py-3 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Start a post
          </button>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
          >
            <PhotoIcon className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
          >
            <VideoCameraIcon className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-sm font-medium">Video</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
          >
            <DocumentTextIcon className="w-6 h-6 text-orange-500 mr-2" />
            <span className="text-sm font-medium">Document</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg transition-colors"
          >
            <PencilIcon className="w-6 h-6 text-rose-500 mr-2" />
            <span className="text-sm font-medium">Write</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Create a post</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What do you want to talk about?"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={5}
                />

                {imagePreview && (
                  <div className="relative mt-4">
                    <div className="aspect-video relative">
                      <Image
                        src={imagePreview}
                        alt="Post preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <label className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <PhotoIcon className="w-6 h-6 text-blue-500" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!content.trim() || loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 