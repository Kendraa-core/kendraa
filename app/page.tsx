'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRightIcon, CheckCircleIcon, UsersIcon, GlobeAltIcon, AcademicCapIcon, BuildingOfficeIcon, HeartIcon, BeakerIcon, CpuChipIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const isClient = useIsClient();
  const { user } = useAuth();

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

  // Redirect logged-in users to feed
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Redirecting to dashboard...</p>
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
              className="flex items-center space-x-4"
            >
              <Link 
                href="/signin" 
                className="px-4 py-2 text-sm font-medium text-[#007fff] border-2 border-[#007fff]/30 hover:border-[#007fff] hover:bg-[#007fff]/5 rounded-lg transition-all duration-200"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-2 text-sm font-medium text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-white via-blue-50/30 to-azure-50/30 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#007fff]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#007fff]/5 to-blue-100/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-12"
            >
               <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#007fff] leading-tight tracking-tight mulish-bold mb-8">
                 kendraa
               </h1>
               <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-8 leading-relaxed">
                 Professional Networking for Global Medical Science Professionals
               </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-8">
                Welcome to a dedicated platform designed to connect, collaborate, and innovate across the vast ecosystem of medical sciences.
              </p>
              <p className="text-xl md:text-2xl font-semibold text-[#007fff] leading-relaxed max-w-4xl mx-auto">
                From Hospitals and Academia to Pharmaceuticals, Medtech, Medical Devices, Research, Medical Engineering, Genetics, Healthcare Entrepreneurs, Universities and Wellness.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
                <Link 
                  href="/signup" 
                className="inline-flex items-center px-10 py-4 text-xl font-semibold text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <span>Get Started Free</span>
                <ArrowRightIcon className="w-6 h-6 ml-3" />
                </Link>
                <Link 
                href="/signin"
                className="inline-flex items-center px-10 py-4 text-xl font-semibold text-[#007fff] bg-white border-2 border-[#007fff] hover:border-[#007fff] hover:bg-[#007fff]/5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                Sign In
                </Link>
            </motion.div>


          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              COLLABORATE, SHARE KNOWLEDGE, CREATE OPPORTUNITIES
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <span className="mulish-semibold">kendraa</span> brings professionals, institutions and innovators together to grow their careers and networks while shaping the future of global healthcare.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-100 rounded-3xl p-10 hover:border-[#007fff]/30 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <UsersIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-6">COLLABORATE</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Connect with healthcare professionals worldwide. Build meaningful relationships and partnerships across the medical science ecosystem.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-100 rounded-3xl p-10 hover:border-[#007fff]/30 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <AcademicCapIcon className="w-10 h-10 text-white" />
                  </div>
                <h3 className="text-2xl font-bold text-black mb-6">SHARE KNOWLEDGE</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Exchange insights, research findings, and best practices. Contribute to the advancement of medical science through knowledge sharing.
                </p>
                  </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-100 rounded-3xl p-10 hover:border-[#007fff]/30 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-6">CREATE OPPORTUNITIES</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Discover career opportunities, research collaborations, and innovative projects. Shape the future of healthcare together.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              Connect Across the Medical Science Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join professionals from every corner of the healthcare industry
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[
              { icon: BuildingOfficeIcon, name: 'Hospitals', color: 'from-blue-500 to-blue-600' },
              { icon: AcademicCapIcon, name: 'Academia', color: 'from-green-500 to-green-600' },
              { icon: BeakerIcon, name: 'Pharmaceuticals', color: 'from-purple-500 to-purple-600' },
              { icon: CpuChipIcon, name: 'Medtech', color: 'from-orange-500 to-orange-600' },
              { icon: HeartIcon, name: 'Medical Devices', color: 'from-red-500 to-red-600' },
              { icon: AcademicCapIcon, name: 'Research', color: 'from-indigo-500 to-indigo-600' },
              { icon: CpuChipIcon, name: 'Medical Engineering', color: 'from-teal-500 to-teal-600' },
              { icon: BeakerIcon, name: 'Genetics', color: 'from-pink-500 to-pink-600' },
              { icon: UsersIcon, name: 'Healthcare Entrepreneurs', color: 'from-yellow-500 to-yellow-600' },
              { icon: GlobeAltIcon, name: 'Universities', color: 'from-gray-500 to-gray-600' }
            ].map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${industry.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <industry.icon className="w-8 h-8 text-white" />
                </div>
                  <h3 className="text-sm font-bold text-black">{industry.name}</h3>
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
              Ready to Join the Future of Healthcare Networking?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
              Connect with thousands of medical science professionals and start building your network today.
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
              <h3 className="font-bold text-white mb-6 text-lg">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors text-lg">About</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors text-lg">Join</Link></li>
                <li><Link href="/signin" className="hover:text-white transition-colors text-lg">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors text-lg">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors text-lg">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-lg">Privacy</Link></li>
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