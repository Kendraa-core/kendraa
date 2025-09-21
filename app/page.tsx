'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Logo from '@/components/common/Logo';
import { 
  ArrowRightIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  HeartIcon, 
  BeakerIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const isClient = useIsClient();
  const { user, profile } = useAuth();
  const router = useRouter();

  // Handle redirects for logged-in users
  useEffect(() => {
    if (user && profile) {
      if (profile.onboarding_completed) {
        // Redirect based on user type
        if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
          router.push('/institution/feed');
        } else {
          router.push('/feed');
        }
      } else {
        // Redirect based on user type
        if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
          router.push('/institution/onboarding');
        } else {
          router.push('/onboarding');
        }
      }
    }
  }, [user, profile, router]);

  // Show loading while checking authentication
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting logged-in users
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-blue-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/signin"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-primary-50"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Single Viewport */}
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                <span className="text-gradient bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  WELCOME TO PROFESSIONAL NETWORKING
                </span>
                <br />
                <span className="text-gray-800">
                  OF LIFE SCIENCES PROFESSIONALS AND ORGANIZATIONS
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                Connect, collaborate, and advance your career in the life sciences industry. 
                Join thousands of healthcare professionals, researchers, and organizations worldwide.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link
                href="/signup"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center text-lg group"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signin"
                className="border-2 border-primary-200 text-primary-700 hover:text-primary-800 hover:border-primary-300 hover:bg-primary-50 px-8 py-4 rounded-xl transition-all duration-300 font-semibold inline-flex items-center justify-center text-lg"
              >
                Sign In
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}