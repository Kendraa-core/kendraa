'use client';

import React, { useState } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function MobileSettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/mob');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );

  const SettingsItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    href, 
    onClick,
    rightElement,
    danger = false
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    href?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => {
    const content = (
      <div className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${danger ? 'hover:bg-red-50' : ''}`}>
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-gray-600'}`} />
          <div>
            <p className={`font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>{title}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {rightElement}
          {(href || onClick) && (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }

    if (onClick) {
      return <button onClick={onClick} className="w-full text-left">{content}</button>;
    }

    return content;
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <MobileLayout title="Settings">
      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              alt={user?.user_metadata?.full_name || 'User'}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user?.user_metadata?.full_name}
              </h1>
              <p className="text-gray-600">
                {user?.user_metadata?.headline || 'Healthcare Professional'}
              </p>
              <Link
                href="/mob/profile/edit"
                className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-1 inline-block"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={UserIcon}
            title="Profile Information"
            subtitle="Update your personal details"
            href="/mob/profile/edit"
          />
          <SettingsItem
            icon={ShieldCheckIcon}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            href="/mob/settings/privacy"
          />
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon={BellIcon}
            title="Notifications"
            subtitle="Manage notification preferences"
            rightElement={
              <Toggle 
                enabled={notifications} 
                onChange={setNotifications}
              />
            }
          />
          <SettingsItem
            icon={darkMode ? MoonIcon : SunIcon}
            title="Dark Mode"
            subtitle="Toggle dark mode appearance"
            rightElement={
              <Toggle 
                enabled={darkMode} 
                onChange={setDarkMode}
              />
            }
          />
          <SettingsItem
            icon={GlobeAltIcon}
            title="Language"
            subtitle="English (US)"
            href="/mob/settings/language"
          />
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="App">
          <SettingsItem
            icon={DevicePhoneMobileIcon}
            title="Mobile Preferences"
            subtitle="Customize mobile experience"
            href="/mob/settings/mobile"
          />
          <SettingsItem
            icon={QuestionMarkCircleIcon}
            title="Help & Support"
            subtitle="Get help and contact support"
            href="/mob/help"
          />
        </SettingsSection>

        {/* Sign Out */}
        <SettingsSection title="Account Actions">
          <SettingsItem
            icon={ArrowRightOnRectangleIcon}
            title="Sign Out"
            subtitle="Sign out of your account"
            onClick={handleSignOut}
            danger={true}
          />
        </SettingsSection>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Kendraa Mobile v1.0.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Healthcare Professional Network
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
