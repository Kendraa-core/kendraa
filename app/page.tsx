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
        router.push('/feed');
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
      <section className="relative pt-20 pb-24 bg-white overflow-hidden">
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
              
              {/* Social Links */}
              <div className="flex space-x-4 mt-8">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#007fff] hover:text-white transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#007fff] hover:text-white transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#007fff] hover:text-white transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#007fff] hover:text-white transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
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
                Connect with physicians, researchers, medical professionals, and healthcare institutions worldwide. Build meaningful relationships, share clinical insights, and discover collaboration opportunities across the entire medical science ecosystem.
              </p>
              
              <ul className="space-y-3 text-gray-600">
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
                <h2 className="text-3xl font-bold text-black">Healthcare Institution Partnerships</h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Build strategic partnerships between hospitals, medical schools, research institutions, and healthcare organizations. Facilitate cross-institutional collaboration, clinical trials, and medical innovation.
              </p>
              
              <ul className="space-y-3 text-gray-600">
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