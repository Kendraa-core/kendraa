'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  KeyIcon,
  TrashIcon,
  Cog6ToothIcon,
  HeartIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

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

  const settingsSections = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: UserIcon,
      description: 'Manage your profile and account information',
      color: 'from-primary-500 to-primary-600',
      items: [
        {
          title: 'Profile Information',
          description: 'Update your personal and professional details',
          action: () => router.push('/profile/setup'),
          actionText: 'Edit Profile',
          icon: UserIcon,
        },
        {
          title: 'Professional Credentials',
          description: 'Manage your medical licenses and certifications',
          action: () => router.push('/profile/setup'),
          actionText: 'Update',
          icon: AcademicCapIcon,
        },
        {
          title: 'Account Security',
          description: 'Change password and security settings',
          action: () => router.push('/security'),
          actionText: 'Secure',
          icon: KeyIcon,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: Cog6ToothIcon,
      description: 'Customize your experience and notifications',
      color: 'from-secondary-500 to-secondary-600',
      items: [
        {
          title: 'Notification Settings',
          description: 'Manage email and push notifications',
          action: () => router.push('/notifications'),
          actionText: 'Configure',
          icon: BellIcon,
        },
        {
          title: 'Privacy Controls',
          description: 'Control your data and privacy settings',
          action: () => router.push('/privacy'),
          actionText: 'Manage',
          icon: ShieldCheckIcon,
        },
        {
          title: 'Language & Region',
          description: 'Set your preferred language and timezone',
          action: () => {},
          actionText: 'English',
          icon: GlobeAltIcon,
          isSelect: true,
        },
      ],
    },
    {
      id: 'professional',
      title: 'Professional Tools',
      icon: ChartBarIcon,
      description: 'Manage your professional features and tools',
      color: 'from-accent-500 to-accent-600',
      items: [
        {
          title: 'Medical Specializations',
          description: 'Update your areas of expertise',
          action: () => router.push('/specializations'),
          actionText: 'Manage',
          icon: HeartIcon,
        },
        {
          title: 'Professional Analytics',
          description: 'View your professional insights and metrics',
          action: () => router.push('/analytics'),
          actionText: 'View',
          icon: ChartBarIcon,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
          
          {/* User Info Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile?.full_name || 'User'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-primary-600 font-medium">
                  {profile?.headline || 'Healthcare Professional'}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  <ShieldCheckIcon className="w-4 h-4 mr-1" />
                  Verified
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
            >
              {/* Section Header */}
              <div className={`bg-gradient-to-r ${section.color} p-6`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    <p className="text-white/80 text-sm">{section.description}</p>
                  </div>
                </div>
              </div>

              {/* Section Items */}
              <div className="divide-y divide-gray-100">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                    className="p-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.isSelect ? (
                          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                          </select>
                        ) : (
                          <button
                            onClick={item.action}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-medium"
                          >
                            {item.actionText}
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
                  <p className="text-white/80 text-sm">Irreversible actions</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
                    <p className="text-gray-600 text-sm">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
          >
            <div className="text-center">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing out...
                  </>
                ) : (
                  <>
                    <span>Sign Out</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
                             <p className="text-gray-500 text-sm mt-3">
                 You&apos;ll be redirected to the home page
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 