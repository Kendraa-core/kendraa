'use client';

import { useState } from 'react';
import { createSamplePostsWithHashtags } from '@/lib/test-db';
import TrendingTopics from '@/components/feed/TrendingTopics';

export default function TestTrendingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateSamplePosts = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await createSamplePostsWithHashtags();
      setMessage('Sample posts created successfully! Check the trending topics below.');
    } catch (error) {
      setMessage('Error creating sample posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Trending Topics Test</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates the real trending topics functionality. 
          Click the button below to create sample posts with hashtags, then see the trending topics update.
        </p>
        
        <button
          onClick={handleCreateSamplePosts}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Creating Posts...' : 'Create Sample Posts with Hashtags'}
        </button>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Topics</h2>
          <TrendingTopics limit={10} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How it Works</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Real Trending Topics</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Extracts hashtags from all posts in the database</li>
              <li>• Counts frequency of each hashtag</li>
              <li>• Sorts by popularity (most used first)</li>
              <li>• Updates in real-time as new posts are created</li>
              <li>• No fake data - only real hashtags from actual posts</li>
            </ul>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Sample Hashtags Used:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>#healthcare - Medical and healthcare topics</div>
                <div>#telemedicine - Remote healthcare services</div>
                <div>#medicalresearch - Research and studies</div>
                <div>#patientcare - Patient care and treatment</div>
                <div>#medicalinnovation - Healthcare technology</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 