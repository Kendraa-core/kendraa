'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        // Redirect based on user type after onboarding is complete
        if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
          router.push('/institution/feed');
        } else {
          router.push('/feed');
        }
      } else {
        // Redirect based on user type for onboarding
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <div className="text-3xl font-bold text-[#007fff] tracking-tight">
                kendraa
              </div>
              <div className="text-sm text-gray-500 -mt-1">
                The future of Professional Networking
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-4"
            >
              <Link 
                href="/signin" 
                className="px-6 py-2 text-sm font-medium text-[#007fff] border border-[#007fff] hover:bg-[#007fff] hover:text-white rounded-lg transition-all duration-200"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-2 text-sm font-medium text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-lg transition-all duration-200"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight mb-8">
                Bringing <span className="relative">
                  <span className="relative z-10">medical professionals</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#007fff]/20 rounded-sm"></span>
                </span> together
               </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                kendraa connects <span className="relative">
                  <span className="relative z-10">physicians, researchers, and healthcare institutions</span>
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#007fff]/20 rounded-sm"></span>
                </span> worldwide to collaborate, share knowledge, and advance medical science together.
              </p>
              
              <Link 
                href="/signup" 
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get started
              </Link>
              
              {/* Quote Section */}
              <div className="mt-12 p-6 bg-gray-50 rounded-2xl border-l-4 border-[#007fff]">
                <p className="text-gray-700 italic leading-relaxed">
                  &ldquo;The future of healthcare lies in collaboration. kendraa provides the platform where medical professionals can connect, share insights, and work together to improve patient outcomes worldwide.&rdquo;
                </p>
                <p className="text-sm text-gray-500 mt-3">— Medical Science Community</p>
              </div>
              
            </motion.div>

            {/* Right Column - Medical Professionals Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full h-96 lg:h-[500px]"
            >
              <Image
                src="/Remove Background Preview.png"
                alt="Medical professionals collaborating and networking"
                fill
                className="object-contain object-center"
                priority
              />
              {/* Hidden accreditation comment */}
              {/* <a href="http://www.freepik.com">Designed by pch.vector / Freepik</a> */}
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
            Whether you&apos;re a physician seeking research collaborations, a medical researcher looking for clinical partners, a healthcare administrator building institutional networks, or a medical device company finding innovation partners - kendraa connects the entire medical science ecosystem.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            {/* Left Column - Professional Networking */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black">Professional Networking for Medical Sciences</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Connect with physicians, researchers, medical professionals, and healthcare institutions worldwide. Build meaningful relationships, share clinical insights, and discover collaboration opportunities across the entire medical science ecosystem.
              </p>
              
              <ul className="space-y-3 text-gray-600 mb-8 flex-grow">
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Connect with physicians, researchers, and medical professionals globally</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Share clinical research findings and medical insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Discover medical career opportunities and research collaborations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Join specialized medical communities and professional groups</span>
                </li>
              </ul>
              
              <Link 
                href="/signup" 
                className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-xl transition-all duration-200 mt-auto"
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
              className="flex flex-col h-full"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black">Healthcare Institution Partnerships</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Build strategic partnerships between hospitals, medical schools, research institutions, and healthcare organizations. Facilitate cross-institutional collaboration, clinical trials, and medical innovation.
              </p>
              
              <ul className="space-y-3 text-gray-600 mb-8 flex-grow">
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Connect hospitals, medical schools, and research institutions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Facilitate clinical research partnerships and medical trials</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Share medical best practices and clinical protocols</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff] flex-shrink-0" />
                  <span>Create joint medical education and training programs</span>
                </li>
              </ul>
              
              <Link 
                href="/signup" 
                className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-xl transition-all duration-200 mt-auto"
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
              Trusted by healthcare professionals worldwide:
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {[
              { name: 'Medical Professionals', type: 'Physicians & Researchers' },
              { name: 'Healthcare Institutions', type: 'Hospitals & Clinics' },
              { name: 'Research Organizations', type: 'Medical Research Labs' },
              { name: 'Medical Schools', type: 'Academic Institutions' }
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
              Ready to Connect with Medical Professionals Worldwide?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join thousands of physicians, researchers, and healthcare professionals who are already building their networks on kendraa.
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