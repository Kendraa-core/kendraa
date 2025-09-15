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
  CheckCircleIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  HeartIcon, 
  SparklesIcon, 
  AcademicCapIcon, 
  BeakerIcon, 
  GlobeAltIcon, 
  ChatBubbleLeftRightIcon, 
  LightBulbIcon, 
  UserIcon,
  ChevronDownIcon
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-blue-600 font-medium">Loading kendraa...</p>
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo size="sm" className="h-8" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                How it works
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                About
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/signin"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The future of
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                healthcare networking
              </span>
               </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect, collaborate, and transform healthcare. Join thousands of professionals building the future of medicine.
               </p>
            </motion.div>

            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center mb-16"
          >
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start your journey
              <ArrowRightIcon className="inline-block w-5 h-5 ml-2" />
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center"
          >
            <p className="text-sm text-gray-500 mb-2">Discover more</p>
            <ChevronDownIcon className="w-6 h-6 text-gray-400 animate-bounce" />
            </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="block text-blue-600">advance healthcare</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed for healthcare professionals who want to make a real difference.
            </p>
            </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UsersIcon,
                title: "Professional Network",
                description: "Connect with healthcare professionals worldwide. Build meaningful relationships that advance your career and improve patient care."
              },
              {
                icon: BuildingOfficeIcon,
                title: "Institution Partnerships",
                description: "Collaborate with hospitals, clinics, and research centers. Find opportunities for partnerships and joint initiatives."
              },
              {
                icon: AcademicCapIcon,
                title: "Knowledge Sharing",
                description: "Share research, best practices, and insights. Learn from experts and contribute to the global healthcare community."
              },
              {
                icon: BeakerIcon,
                title: "Research Collaboration",
                description: "Find research partners, share findings, and collaborate on groundbreaking medical research and clinical trials."
              },
              {
                icon: GlobeAltIcon,
                title: "Global Reach",
                description: "Access healthcare professionals from around the world. Break down geographical barriers and expand your impact."
              },
              {
                icon: LightBulbIcon,
                title: "Innovation Hub",
                description: "Discover new technologies, methodologies, and approaches. Stay at the forefront of healthcare innovation."
              }
            ].map((feature, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
            </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple. Powerful.
              <span className="block text-blue-600">Effective.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and begin transforming healthcare today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create your profile",
                description: "Set up your professional profile in minutes. Showcase your expertise, experience, and passion for healthcare."
              },
              {
                step: "02",
                title: "Connect & collaborate",
                description: "Find and connect with like-minded professionals. Join discussions, share knowledge, and build meaningful relationships."
              },
              {
                step: "03",
                title: "Transform healthcare",
                description: "Work together on projects, research, and initiatives that make a real difference in healthcare outcomes."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-blue-100 mb-4">
                  {step.step}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform
              <span className="block">healthcare?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of healthcare professionals who are already making a difference. Your journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/signup" 
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get started free
                <ArrowRightIcon className="inline-block w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="/signin" 
                className="text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <Logo size="sm" className="h-8 filter brightness-0 invert" />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Connecting healthcare professionals worldwide to advance medicine and improve patient care.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</Link></li>
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Get started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 kendraa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}