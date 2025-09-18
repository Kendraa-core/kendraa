'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostById } from '@/lib/queries';
import PostCard from '@/components/post/PostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS
} from '@/lib/design-system';
import type { Post, Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<(Post & { profiles?: Profile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const postData = await getPostById(id as string);
        
        if (!postData) {
          setError('Post not found');
          return;
        }

        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading post..." />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className={`${COMPONENTS.card.base} text-center py-12`}>
            <h1 className={`${TYPOGRAPHY.heading.h2} mb-4`}>Post Not Found</h1>
            <p className={`${TYPOGRAPHY.body.large} ${TEXT_COLORS.secondary} mb-6`}>
              {error || 'The post you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <button
              onClick={() => router.back()}
              className={`flex items-center mx-auto px-4 py-2 ${COMPONENTS.button.primary} rounded-lg hover:bg-blue-700 transition-colors`}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className={`flex items-center px-4 py-2 ${COMPONENTS.button.secondary} rounded-lg hover:bg-gray-100 transition-colors`}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Post */}
        <PostCard 
          post={post} 
          onInteraction={() => {
            // Refresh post data if needed
            window.location.reload();
          }} 
          onPostDeleted={() => {}}
        />
      </div>
    </div>
  );
}
