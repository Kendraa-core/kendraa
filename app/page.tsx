'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRightIcon, CheckCircleIcon, UsersIcon, GlobeAltIcon, AcademicCapIcon, BuildingOfficeIcon, HeartIcon, BeakerIcon, CpuChipIcon, SparklesIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, CalendarIcon, ChartBarIcon, PhotoIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
          router.push('/institution/dashboard');
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Loading <span className="mulish-semibold">kendraa</span>...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting logged-in users
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center"
            >
              <Logo size="md" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-6"
            >
              <Link href="/feed" className="text-gray-700 hover:text-[#007fff] transition-colors">Network</Link>
              <Link href="/jobs" className="text-gray-700 hover:text-[#007fff] transition-colors">Jobs</Link>
              <Link href="/events" className="text-gray-700 hover:text-[#007fff] transition-colors">Events</Link>
              <Link href="/groups" className="text-gray-700 hover:text-[#007fff] transition-colors">Groups</Link>
              <Link 
                href="/signup" 
                className="px-6 py-2 text-sm font-medium text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign Up
              </Link>
              <Link 
                href="/signin" 
                className="text-gray-700 hover:text-[#007fff] transition-colors"
              >
                Login
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 bg-gradient-to-br from-[#007fff] to-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-8">
                Let&apos;s make medical networking easier.
               </h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8">
                kendraa is a professional networking platform made for medical science professionals and healthcare institutions.
               </p>
            </motion.div>

            {/* Right Column - Medical Science Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-[500px]">
                <svg viewBox="0 0 600 400" className="w-full h-full">
                  <defs>
                    <linearGradient id="deskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                  </defs>
                  
                  {/* Desk */}
                  <rect x="50" y="250" width="500" height="20" fill="url(#deskGradient)" rx="10" />
                  
                  {/* Laptop */}
                  <rect x="200" y="200" width="200" height="120" fill="url(#screenGradient)" rx="8" />
                  <rect x="210" y="210" width="180" height="100" fill="#ffffff" rx="4" />
                  
                  {/* Medical Icons Floating Around */}
                  {/* Heart Icon */}
                  <g transform="translate(100, 120)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ef4444" />
                  </g>
                  
                  {/* Calendar Icon */}
                  <g transform="translate(450, 100)">
                    <rect x="2" y="4" width="20" height="18" fill="white" stroke="#007fff" strokeWidth="2" rx="2" />
                    <rect x="2" y="2" width="20" height="4" fill="#007fff" />
                    <text x="12" y="6" textAnchor="middle" className="text-xs font-bold fill-white">15</text>
                  </g>
                  
                  {/* Chat Bubble with Question */}
                  <g transform="translate(80, 180)">
                    <ellipse cx="15" cy="15" rx="12" ry="10" fill="white" stroke="#007fff" strokeWidth="2" />
                    <text x="15" y="12" textAnchor="middle" className="text-xs font-bold fill-gray-600">?</text>
                    <path d="M8 20 L15 15 L22 20" fill="white" stroke="#007fff" strokeWidth="2" />
                  </g>
                  
                  {/* Chat Bubble with Exclamation */}
                  <g transform="translate(480, 200)">
                    <ellipse cx="15" cy="15" rx="12" ry="10" fill="white" stroke="#007fff" strokeWidth="2" />
                    <text x="15" y="12" textAnchor="middle" className="text-xs font-bold fill-gray-600">!</text>
                    <path d="M8 20 L15 15 L22 20" fill="white" stroke="#007fff" strokeWidth="2" />
                  </g>
                  
                  {/* Chart Icon */}
                  <g transform="translate(120, 80)">
                    <rect x="2" y="2" width="20" height="16" fill="white" stroke="#007fff" strokeWidth="2" rx="2" />
                    <rect x="6" y="12" width="3" height="4" fill="#007fff" />
                    <rect x="10" y="8" width="3" height="8" fill="#007fff" />
                    <rect x="14" y="4" width="3" height="12" fill="#007fff" />
                  </g>
                  
                  {/* Photo/Research Icon */}
                  <g transform="translate(420, 60)">
                    <rect x="2" y="6" width="16" height="12" fill="white" stroke="#007fff" strokeWidth="2" rx="2" />
                    <circle cx="8" cy="10" r="2" fill="#007fff" />
                    <path d="M2 18 L6 14 L10 16 L18 8" stroke="#007fff" strokeWidth="2" fill="none" />
                  </g>
                  
                  {/* Users/Network Icon */}
                  <g transform="translate(350, 80)">
                    <circle cx="8" cy="8" r="6" fill="white" stroke="#007fff" strokeWidth="2" />
                    <circle cx="8" cy="6" r="2" fill="#007fff" />
                    <path d="M4 12 Q8 8 12 12" stroke="#007fff" strokeWidth="2" fill="none" />
                    <circle cx="20" cy="8" r="6" fill="white" stroke="#007fff" strokeWidth="2" />
                    <circle cx="20" cy="6" r="2" fill="#007fff" />
                    <path d="M16 12 Q20 8 24 12" stroke="#007fff" strokeWidth="2" fill="none" />
                  </g>
                  
                  {/* Plant on Desk */}
                  <g transform="translate(150, 230)">
                    <rect x="8" y="0" width="4" height="20" fill="#8b5cf6" />
                    <circle cx="10" cy="5" r="8" fill="#10b981" />
                    <circle cx="6" cy="8" r="6" fill="#059669" />
                    <circle cx="14" cy="7" r="5" fill="#047857" />
                  </g>
                  
                  {/* Coffee Cup */}
                  <g transform="translate(400, 220)">
                    <rect x="2" y="0" width="12" height="16" fill="white" stroke="#007fff" strokeWidth="2" rx="2" />
                    <rect x="0" y="2" width="16" height="2" fill="#8b4513" />
                    <rect x="14" y="4" width="2" height="8" fill="#8b4513" />
                  </g>
                  
                  {/* Lamp */}
                  <g transform="translate(500, 200)">
                    <rect x="8" y="0" width="4" height="30" fill="#6b7280" />
                    <rect x="2" y="30" width="16" height="4" fill="#6b7280" />
                    <circle cx="10" cy="25" r="8" fill="#fbbf24" opacity="0.8" />
                  </g>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-gray-700 leading-relaxed"
          >
            Whether you&apos;re a healthcare professional looking to expand your network, a researcher seeking collaboration opportunities, or an institution building partnerships - we&apos;ve got you covered.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Professional Networking */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-2xl flex items-center justify-center">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black">Professional Networking for Medical Sciences</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with healthcare professionals, researchers, and medical institutions worldwide. Build meaningful relationships, share knowledge, and discover collaboration opportunities across the entire medical science ecosystem.
              </p>
              
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Connect with professionals from hospitals, research labs, and universities</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Share research findings and clinical insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Discover career opportunities and research collaborations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Join specialized groups and communities</span>
                </li>
              </ul>
              
              <Link 
                href="/signup" 
                className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-xl transition-all duration-200"
              >
                Learn more about Networking
              </Link>
            </motion.div>

            {/* Right Column - Institution Collaboration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-2xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black">Institution Partnerships & Collaboration</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Build strategic partnerships between hospitals, universities, research institutions, and healthcare organizations. Facilitate cross-institutional collaboration and knowledge sharing.
              </p>
              
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Connect institutions across different healthcare sectors</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Facilitate research partnerships and clinical trials</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Share best practices and institutional knowledge</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Create joint educational and training programs</span>
                </li>
              </ul>
              
              <Link 
                href="/signup" 
                className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-xl transition-all duration-200"
              >
                Learn more about Partnerships
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medical Institutions Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              These medical institutions already rely on kendraa:
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {[
              { name: 'Johns Hopkins', type: 'Hospital' },
              { name: 'Mayo Clinic', type: 'Medical Center' },
              { name: 'Cleveland Clinic', type: 'Hospital' },
              { name: 'Mass General', type: 'Hospital' }
            ].map((institution, index) => (
              <motion.div
                key={institution.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{institution.name}</h3>
                  <p className="text-sm text-gray-600">{institution.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Signup Section */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Side - Pricing */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
                Starting at Free
              </h2>
              
              <ul className="space-y-4 text-lg text-gray-700">
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-[#007fff] flex-shrink-0" />
                  <span>Unlimited Professional Connections</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-[#007fff] flex-shrink-0" />
                  <span>Access to Medical Science Communities</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-[#007fff] flex-shrink-0" />
                  <span>Research Collaboration Tools</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-[#007fff] flex-shrink-0" />
                  <span>Institution Partnership Features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-[#007fff] flex-shrink-0" />
                  <span>Simple, Transparent Pricing</span>
                </li>
              </ul>
              
              <Link 
                href="/signup" 
                className="inline-flex items-center text-lg font-semibold text-[#007fff] hover:text-blue-600 transition-colors"
              >
                See Pricing Table »
              </Link>
            </motion.div>

            {/* Right Side - Free Trial Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-black mb-4">
                Request Free Access
              </h3>
              <p className="text-gray-600 mb-8">
                Join kendraa for free and start building your medical science network today.
              </p>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution/Organization
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                    placeholder="Enter your institution name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Role
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                    placeholder="e.g., Doctor, Researcher, Administrator"
                  />
                </div>
                
                <Link 
                  href="/signup" 
                  className="w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-xl transition-all duration-200"
                >
                  Request Access
                </Link>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#007fff] to-blue-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Join the Future of Healthcare Networking?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join the medical science community and start building meaningful professional connections today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/signup" 
                className="inline-flex items-center px-10 py-4 text-xl font-semibold text-[#007fff] bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="w-6 h-6 ml-3" />
              </Link>
              <Link 
                href="/signin" 
                className="inline-flex items-center px-10 py-4 text-xl font-semibold text-white border-2 border-white hover:bg-white hover:text-[#007fff] rounded-2xl transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Logo size="sm" />
              <p className="text-gray-400 mt-6 max-w-md text-lg leading-relaxed">
                Professional networking platform for global medical science professionals. Connect, collaborate, and innovate across the healthcare ecosystem.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors text-lg">Contact</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors text-lg">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-lg">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">The Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors text-lg">About Us</Link></li>
                <li><Link href="/feed" className="hover:text-white transition-colors text-lg">Network</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors text-lg">Jobs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Use Cases</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition-colors text-lg">For Professionals</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors text-lg">For Institutions</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors text-lg">For Researchers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Account</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/signin" className="hover:text-white transition-colors text-lg">Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors text-lg">Signup</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-lg">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2025 <span className="mulish-semibold">kendraa</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}