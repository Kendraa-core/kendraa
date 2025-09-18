'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Logo from '@/components/common/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
  ChevronDownIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  StarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  RocketLaunchIcon,
  EyeIcon,
  HandRaisedIcon
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section - Just Logo */}
            <div className="flex items-center">
              <Logo size="md" className="h-10 w-10" />
            </div>
            
            {/* Navigation Links - Centered and Consistent */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Features
              </Link>
              <Link href="#vision" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Our Vision
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                About
              </Link>
            </div>
            
            {/* Action Buttons - Consistent Alignment */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/signin"
                className="border border-gray-300 text-gray-700 hover:text-[#007fff] hover:border-[#007fff] px-4 py-2 rounded-lg transition-all duration-300 font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/signup"
                className="bg-[#007fff] text-white px-6 py-2 rounded-lg hover:bg-[#007fff]/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-[#007fff]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium mb-6">
                    🚀 Join Now • Building the Future of Healthcare Networking
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  The Healthcare Network
                  <span className="text-[#007fff]"> We&apos;re Building</span><br />
                  <span className="bg-gradient-to-r from-[#007fff] to-purple-600 bg-clip-text text-transparent">
                    Together
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Join us in creating the premier networking platform for healthcare professionals. 
                  Be among the first to shape the future of medical collaboration and career advancement.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/signup"
                    className="bg-[#007fff] hover:bg-[#007fff]/90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                  >
                    <RocketLaunchIcon className="w-5 h-5 mr-2" />
                    Join Now
                  </Link>
                  <Link
                    href="#vision"
                    className="border-2 border-[#007fff] text-[#007fff] hover:bg-[#007fff]/5 px-8 py-3 rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center"
                  >
                    <EyeIcon className="w-5 h-5 mr-2" />
                    See Our Vision
                  </Link>
                </div>
                
              </motion.div>
            </div>
            
            {/* Vision Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-[#007fff]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <HeartIcon className="w-10 h-10 text-[#007fff]" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-gray-600">Connecting healthcare professionals to advance medicine and improve patient care worldwide</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#007fff]/5 rounded-xl p-4">
                      <UsersIcon className="w-6 h-6 text-[#007fff] mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Professional</div>
                      <div className="text-xs text-gray-600">Networking</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <AcademicCapIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Knowledge</div>
                      <div className="text-xs text-gray-600">Sharing</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <BriefcaseIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Career</div>
                      <div className="text-xs text-gray-600">Growth</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4">
                      <BeakerIcon className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Research</div>
                      <div className="text-xs text-gray-600">Collaboration</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 italic">
                    &quot;Building something meaningful takes time. Join us on this journey.&quot;
                  </div>
                </div>
              </Card>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#007fff]/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center px-4 py-2 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium mb-4">
              🛠️ What We&apos;re Building
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Features Designed for
              <span className="text-[#007fff]"> Healthcare Professionals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re creating comprehensive tools specifically for the healthcare industry, 
              built with input from medical professionals like you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UsersIcon,
                title: "Professional Networking",
                description: "Connect with healthcare professionals across all medical specialties. Build meaningful professional relationships."
              },
              {
                icon: BriefcaseIcon,
                title: "Healthcare Job Board",
                description: "Specialized job platform for medical positions. Find opportunities that match your expertise and career goals."
              },
              {
                icon: CalendarDaysIcon,
                title: "Medical Events",
                description: "Discover conferences, CME courses, and medical workshops. Stay updated with continuing education."
              },
              {
                icon: BuildingOfficeIcon,
                title: "Institution Profiles",
                description: "Healthcare institutions can showcase services, post positions, and connect with professionals."
              },
              {
                icon: DevicePhoneMobileIcon,
                title: "Mobile Experience",
                description: "Full mobile app experience for networking on-the-go. Available on iOS and Android."
              },
              {
                icon: ShieldCheckIcon,
                title: "HIPAA Compliance",
                description: "Built with healthcare privacy standards in mind. Your professional data stays secure."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-gray-200/50 bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#007fff]/20 transition-colors duration-300">
                      <feature.icon className="w-8 h-8 text-[#007fff]" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-[#007fff] transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              🎯 Our Vision
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transforming Healthcare Through
              <span className="text-[#007fff]"> Connection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We envision a world where every healthcare professional has access to the network, 
              knowledge, and opportunities they need to provide the best possible patient care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: GlobeAltIcon,
                title: "Global Healthcare Network",
                description: "Breaking down geographical barriers to connect medical professionals worldwide, fostering international collaboration and knowledge exchange."
              },
              {
                icon: LightBulbIcon,
                title: "Knowledge Democratization",
                description: "Making medical expertise and research accessible to all healthcare professionals, regardless of location or institution size."
              },
              {
                icon: HeartIcon,
                title: "Better Patient Outcomes",
                description: "Ultimately improving patient care by enabling better collaboration, knowledge sharing, and professional development among healthcare teams."
              }
            ].map((vision, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-gray-200/50 bg-white/80 text-center h-full">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#007fff]/20 transition-colors duration-300">
                      <vision.icon className="w-8 h-8 text-[#007fff]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#007fff] transition-colors">
                      {vision.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {vision.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="inline-block p-8 bg-gradient-to-r from-[#007fff] to-purple-600 border-0 shadow-2xl text-white">
              <div className="max-w-2xl">
                <HandRaisedIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-4">Be Part of Something Bigger</h3>
                <p className="text-white/90 mb-6">
                  Join our early access community and help us build the healthcare networking platform 
                  that the medical community deserves. Your input will shape our development.
                </p>
                <Link
                  href="/signup"
                  className="bg-white text-[#007fff] px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <RocketLaunchIcon className="w-5 h-5 mr-2" />
                  Join Now
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#007fff] to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <RocketLaunchIcon className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Shape the Future of Healthcare Networking?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our early access program and be part of building something that will transform 
              how healthcare professionals connect, collaborate, and grow their careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-[#007fff] px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Join Now
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Logo size="sm" className="h-8" />
                <span className="text-xl font-bold">Kendraa</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting healthcare professionals worldwide to advance medicine and improve patient care.
              </p>
            </div>
            
            {/* Navigation Links */}
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#vision" className="hover:text-white transition-colors">Our Vision</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Join Now</Link></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; 2025 Kendraa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
