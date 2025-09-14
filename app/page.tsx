'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRightIcon, CheckCircleIcon, UsersIcon, BuildingOfficeIcon, HeartIcon, SparklesIcon, AcademicCapIcon, BeakerIcon, GlobeAltIcon, ChatBubbleLeftRightIcon, LightBulbIcon, UserIcon } from '@heroicons/react/24/outline';

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
              <Link 
                href="/signup" 
                className="px-6 py-2 text-sm font-medium text-white bg-[#007fff] hover:bg-[#007fff]/90 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
              <Link 
                href="/signin" 
                className="text-gray-700 hover:text-[#007fff] transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#007fff] via-blue-600 to-indigo-700 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight mb-8">
              The Future of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                Healthcare
              </span>
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl">Starts Here</span>
               </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-12 max-w-4xl mx-auto">
              Join the world&apos;s most innovative healthcare professionals, researchers, and institutions. 
              Collaborate, discover, and transform medicine together.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/signup" 
                className="group inline-flex items-center px-10 py-4 text-xl font-semibold text-[#007fff] bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span>Start Your Journey</span>
                <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signin" 
                className="inline-flex items-center px-10 py-4 text-xl font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 rounded-2xl transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Medical Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-1/4 left-1/6"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute top-1/3 right-1/6"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="absolute bottom-1/3 left-1/4"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="absolute bottom-1/4 right-1/4"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <SparklesIcon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Where Innovation Meets
              <br />
              <span className="text-[#007fff]">Healthcare Excellence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re not just another networking platform. We&apos;re the catalyst for the next generation of healthcare breakthroughs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: LightBulbIcon,
                title: "Breakthrough Research",
                description: "Connect with leading researchers and discover cutting-edge studies that are shaping the future of medicine.",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: UsersIcon,
                title: "Global Collaboration",
                description: "Build meaningful relationships with healthcare professionals from every corner of the world.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BuildingOfficeIcon,
                title: "Institutional Partnerships",
                description: "Create powerful alliances between hospitals, universities, and research institutions.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: AcademicCapIcon,
                title: "Knowledge Exchange",
                description: "Share expertise, learn from peers, and stay ahead of the latest medical advancements.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: BeakerIcon,
                title: "Clinical Innovation",
                description: "Collaborate on clinical trials, share best practices, and drive patient care forward.",
                color: "from-red-500 to-rose-500"
              },
              {
                icon: GlobeAltIcon,
                title: "Global Impact",
                description: "Be part of a community that&apos;s solving healthcare challenges on a global scale.",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Journey to
              <br />
              <span className="text-[#007fff]">Healthcare Excellence</span>
              </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of healthcare professionals who are already transforming medicine.
            </p>
            </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Set up your professional profile and showcase your expertise, research interests, and achievements.",
                icon: UserIcon
              },
              {
                step: "02", 
                title: "Connect & Collaborate",
                description: "Discover like-minded professionals, join research groups, and start meaningful conversations.",
                icon: ChatBubbleLeftRightIcon
              },
              {
                step: "03",
                title: "Transform Healthcare",
                description: "Work together on groundbreaking projects, share knowledge, and make a real impact on patient care.",
                icon: SparklesIcon
              }
            ].map((step, index) => (
            <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#007fff] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-10 h-10 text-white" />
                </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#007fff]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Shape the Future of Healthcare?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join the community that&apos;s revolutionizing medicine. Your next breakthrough collaboration is waiting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/signup" 
                className="group inline-flex items-center px-10 py-4 text-xl font-semibold text-gray-900 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span>Start Your Journey</span>
                <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signin" 
                className="inline-flex items-center px-10 py-4 text-xl font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 rounded-2xl transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Logo size="sm" />
              <p className="text-gray-400 mt-4 max-w-md">
                Connecting healthcare professionals worldwide to advance medicine and improve patient care.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-8 text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/help" className="hover:text-white transition-colors">Help</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 <span className="mulish-semibold">kendraa</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}