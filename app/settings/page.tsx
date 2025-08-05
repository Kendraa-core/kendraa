'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  KeyIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Profile Settings */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Profile</h3>
                    <p className="text-sm text-gray-500">Manage your profile information</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/profile/setup')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">Manage your notification preferences</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/notifications')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Privacy</h3>
                    <p className="text-sm text-gray-500">Control your privacy settings</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Configure
                </button>
              </div>
            </div>

            {/* Language Settings */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Language</h3>
                    <p className="text-sm text-gray-500">Choose your preferred language</p>
                  </div>
                </div>
                <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            {/* Security Settings */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Security</h3>
                    <p className="text-sm text-gray-500">Manage your account security</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Secure
                </button>
              </div>
            </div>

            {/* Account Deletion */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrashIcon className="h-5 w-5 text-red-400" />
                  <div>
                    <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-gray-500">Permanently delete your account</p>
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 