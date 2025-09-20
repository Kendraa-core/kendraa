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
  CheckCircleIcon
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="md" className="h-8 w-8" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/signin"
                className="border border-gray-300 text-gray-700 hover:text-[#007fff] hover:border-[#007fff] px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm"
              >
                Sign in
              </Link>
              <Link 
                href="/signup"
                className="bg-[#007fff] text-white px-6 py-2 rounded-lg hover:bg-[#007fff]/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Single Viewport */}
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium mb-6">
                  🧬 Life Sciences Networking Platform
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Connect with
                <span className="text-[#007fff]"> Life Sciences</span><br />
                <span className="bg-gradient-to-r from-[#007fff] to-purple-600 bg-clip-text text-transparent">
                  Professionals
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Join the premier networking platform for life sciences professionals. 
                Connect, collaborate, and advance your career in biotechnology, pharmaceuticals, 
                and medical research.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  href="/signup"
                  className="bg-[#007fff] hover:bg-[#007fff]/90 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center text-lg"
                >
                  <RocketLaunchIcon className="w-6 h-6 mr-2" />
                  Join Now - It&apos;s Free
                </Link>
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>Verified professionals</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>Industry focused</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right Content - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-[#007fff]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <BeakerIcon className="w-10 h-10 text-[#007fff]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Life Sciences Network</h3>
                  <p className="text-gray-600 mb-6">Connect with professionals across the life sciences industry</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#007fff]/5 rounded-xl p-4 text-center">
                    <UsersIcon className="w-8 h-8 text-[#007fff] mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Networking</div>
                    <div className="text-xs text-gray-600">Connect & Collaborate</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <BuildingOfficeIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Companies</div>
                    <div className="text-xs text-gray-600">Biotech & Pharma</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <HeartIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Research</div>
                    <div className="text-xs text-gray-600">Medical Innovation</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <BeakerIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Careers</div>
                    <div className="text-xs text-gray-600">Job Opportunities</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link
                    href="/signup"
                    className="bg-[#007fff] text-white px-6 py-3 rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium inline-flex items-center"
                  >
                    <ArrowRightIcon className="w-5 h-5 mr-2" />
                    Get Started Today
                  </Link>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#007fff]/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size="sm" className="h-6" />
              <span className="text-lg font-bold">Kendraa</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Kendraa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}