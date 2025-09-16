'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostById, getPostAnalytics } from '@/lib/queries';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { ArrowLeftIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS
} from '@/lib/design-system';
import type { Post, Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

interface PostAnalytics {
  impressions: number;
  members_reached: number;
  profile_viewers: number;
  followers_gained: number;
  video_views?: number;
  watch_time?: number;
  average_watch_time?: number;
  reactions: number;
  comments: number;
  reposts: number;
  saves: number;
  shares: number;
}

export default function PostAnalyticsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<(Post & { profiles?: Profile }) | null>(null);
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [postData, analyticsData] = await Promise.all([
          getPostById(id as string),
          getPostAnalytics(id as string)
        ]);
        
        if (!postData) {
          setError('Post not found');
          return;
        }

        setPost(postData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching post analytics:', error);
        setError('Failed to load analytics');
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadAnalytics = () => {
    if (!analytics) return;
    
    const data = {
      post_id: id,
      post_content: post?.content,
      created_at: post?.created_at,
      ...analytics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-analytics-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics downloaded successfully');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (error || !post || !analytics) {
    return (
      <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className={`${COMPONENTS.card.base} text-center py-12`}>
            <h1 className={`${TYPOGRAPHY.heading.h2} mb-4`}>Analytics Not Available</h1>
            <p className={`${TYPOGRAPHY.body.large} ${TEXT_COLORS.secondary} mb-6`}>
              {error || 'Analytics for this post are not available.'}
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className={`flex items-center px-4 py-2 ${COMPONENTS.button.secondary} rounded-lg hover:bg-gray-100 transition-colors`}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className={`${TYPOGRAPHY.heading.h1}`}>Post analytics</h1>
              <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                Posted {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadAnalytics}
            className={`flex items-center px-4 py-2 ${COMPONENTS.button.primary} rounded-lg hover:bg-blue-700 transition-colors`}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>

        {/* Post Preview */}
        <div className={`${COMPONENTS.card.base} mb-8`}>
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {post.profiles?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className={`${TYPOGRAPHY.body.medium} font-semibold`}>
                  {post.profiles?.full_name || 'Unknown User'}
                </h3>
                <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-2`}>
                  {post.profiles?.headline || 'Healthcare Professional'}
                </p>
                <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                  {new Date(post.created_at).toLocaleDateString()} • Public
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary}`}>
                {post.content}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discovery */}
          <div className={`${COMPONENTS.card.base}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${TYPOGRAPHY.heading.h3}`}>Discovery</h3>
                <span className="text-gray-400 text-sm">?</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.impressions.toLocaleString()}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Impressions</p>
                </div>
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.members_reached.toLocaleString()}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Members reached</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Activity */}
          <div className={`${COMPONENTS.card.base}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${TYPOGRAPHY.heading.h3}`}>Profile activity</h3>
                <span className="text-gray-400 text-sm">?</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.profile_viewers}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Profile viewers from this post</p>
                </div>
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.followers_gained}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Followers gained from this post</p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Performance (if applicable) */}
          {analytics.video_views && (
            <div className={`${COMPONENTS.card.base} md:col-span-2`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`${TYPOGRAPHY.heading.h3}`}>Video performance</h3>
                  <span className="text-gray-400 text-sm">?</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                      {analytics.video_views.toLocaleString()}
                    </div>
                    <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Video Views</p>
                  </div>
                  <div>
                    <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                      {analytics.watch_time ? `${Math.floor(analytics.watch_time / 3600)}h ${Math.floor((analytics.watch_time % 3600) / 60)}m ${Math.floor(analytics.watch_time % 60)}s` : '0s'}
                    </div>
                    <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Watch time</p>
                  </div>
                  <div>
                    <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                      {analytics.average_watch_time ? `${analytics.average_watch_time}s` : '0s'}
                    </div>
                    <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Average watch time</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Engagement */}
          <div className={`${COMPONENTS.card.base} md:col-span-2`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${TYPOGRAPHY.heading.h3}`}>Social engagement</h3>
                <span className="text-gray-400 text-sm">?</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.reactions}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Reactions</p>
                </div>
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.comments}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Comments</p>
                </div>
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.reposts}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Reposts</p>
                </div>
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.saves}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Saves</p>
                </div>
                <div>
                  <div className={`${TYPOGRAPHY.heading.h2} ${TEXT_COLORS.primary}`}>
                    {analytics.shares}
                  </div>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Sends on Kendraa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
