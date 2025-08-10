'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DemoPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'configured' | 'not-configured'>('checking');

  useEffect(() => {
    // Check if Supabase is properly configured
    if (supabase) {
      setSupabaseStatus('configured');
    } else {
      setSupabaseStatus('not-configured');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kendraa Demo</h1>
          <p className="text-gray-600">Application Status Check</p>
        </div>

        <div className="space-y-6">
          {/* Supabase Configuration Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Configuration</h2>
            
            {supabaseStatus === 'checking' && (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Checking configuration...</span>
              </div>
            )}

            {supabaseStatus === 'configured' && (
              <div className="flex items-center space-x-3 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Supabase is properly configured!</span>
              </div>
            )}

            {supabaseStatus === 'not-configured' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Supabase is not configured</span>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Setup Required</h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    To use all features (follow system, job applications, etc.), you need to configure Supabase credentials.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Step 1: Create a Supabase Project</h4>
                      <p className="text-sm text-yellow-700">Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> and create a new project</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Step 2: Get Your Credentials</h4>
                      <p className="text-sm text-yellow-700">In your Supabase dashboard, go to Settings → API and copy your URL and anon key</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Step 3: Update Environment Variables</h4>
                      <p className="text-sm text-yellow-700">Create or update your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with:</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key`}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Step 4: Restart the Development Server</h4>
                      <p className="text-sm text-yellow-700">Stop the current server (Ctrl+C) and run <code className="bg-yellow-100 px-1 rounded">npm run dev</code> again</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Features Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Status</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Follow System</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  supabaseStatus === 'configured' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supabaseStatus === 'configured' ? 'Available' : 'Requires Setup'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Job Applications</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  supabaseStatus === 'configured' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supabaseStatus === 'configured' ? 'Available' : 'Requires Setup'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">User Authentication</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  supabaseStatus === 'configured' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supabaseStatus === 'configured' ? 'Available' : 'Requires Setup'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Real-time Features</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  supabaseStatus === 'configured' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {supabaseStatus === 'configured' ? 'Available' : 'Requires Setup'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Try the App</h2>
            <p className="text-gray-600 mb-4">
              You can still explore the UI and see how the application looks, even without database functionality.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/feed" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Feed
              </a>
              <a href="/network" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Network
              </a>
              <a href="/jobs" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Jobs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 