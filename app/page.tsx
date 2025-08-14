'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { useIsClient } from '@/hooks/useIsClient';
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const isClient = useIsClient();
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center py-6">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Logo />
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
                <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Stories</a>
                <a href="#faq" className="text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
              </nav>

              {/* CTA Buttons */}
              <div className="flex items-center space-x-4">
                <Link href="/signin" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100/80 backdrop-blur-sm rounded-full border border-emerald-200/50 mb-8">
                  <HeartIcon className="w-4 h-4 text-emerald-600 mr-2" />
                  <span className="text-sm text-emerald-700 font-medium">Exclusively for Healthcare Professionals</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Your Global
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> Medical Community</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Connect with verified doctors, nurses, researchers, and medical professionals worldwide. 
                  Share knowledge, advance your career, and collaborate on cases in a secure, HIPAA-compliant environment.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Link 
                    href="/signup" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Try It Out</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <Link 
                    href="#features" 
                    className="border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    <HeartIcon className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                    24/7
                  </div>
                  <div className="text-gray-600">Medical Support</div>
                  <div className="text-xs text-gray-500">Always-on community</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                    100%
                  </div>
                  <div className="text-gray-600">Verified Professionals</div>
                  <div className="text-xs text-gray-500">Licensed & authenticated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    50+
                  </div>
                  <div className="text-gray-600">Medical Specialties</div>
                  <div className="text-xs text-gray-500">All fields covered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-600 mb-2">
                    <GlobeAltIcon className="w-8 h-8 mx-auto mb-2 text-accent-600" />
                    Global
                  </div>
                  <div className="text-gray-600">Medical Network</div>
                  <div className="text-xs text-gray-500">Worldwide connections</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Built for Healthcare Excellence
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every feature is designed specifically for medical professionals, ensuring secure, 
                compliant, and meaningful connections within the global healthcare community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheckIcon,
                  title: 'Medical Verification',
                  description: 'Every professional is verified with license checks and credential validation. Trust is built into every connection.',
                  color: 'from-emerald-500 to-emerald-600'
                },
                {
                  icon: UserGroupIcon,
                  title: 'Specialty Communities',
                  description: 'Join exclusive groups for your medical specialty - cardiology, neurology, pediatrics, and 50+ more specialties.',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  icon: AcademicCapIcon,
                  title: 'CME & Education',
                  description: 'Access accredited continuing medical education courses, research papers, and earn certificates directly through the platform.',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  icon: HeartIcon,
                  title: 'Anonymous Case Discussions',
                  description: 'HIPAA-compliant forums for discussing challenging cases with global experts while maintaining patient privacy.',
                  color: 'from-red-500 to-red-600'
                },
                {
                  icon: BriefcaseIcon,
                  title: 'Medical Career Hub',
                  description: 'Find hospital positions, locum opportunities, research fellowships, and pharmaceutical roles from verified healthcare institutions.',
                  color: 'from-green-500 to-green-600'
                },
                {
                  icon: GlobeAltIcon,
                  title: 'Global Tele-Mentoring',
                  description: 'Connect with specialists worldwide for virtual mentoring, surgical training, and knowledge exchange sessions.',
                  color: 'from-indigo-500 to-indigo-600'
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Join the Global Medical Community Today
              </h2>
                              <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Connect with verified healthcare professionals, advance your career, and contribute to the future of medicine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/signup" 
                  className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link 
                  href="#features" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Logo />
                <p className="mt-4 text-gray-400">
                  The premier networking platform for healthcare professionals worldwide.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                  <li><a href="/dashboard" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Compliance</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Community</h3>
                <ul className="space-y-2 text-gray-400">
                                  <li><a href="/feed" className="hover:text-white transition-colors">Specialties</a></li>
                <li><a href="/events" className="hover:text-white transition-colors">Events</a></li>
                <li><a href="/feed" className="hover:text-white transition-colors">Research</a></li>
                <li><a href="/feed" className="hover:text-white transition-colors">Mentoring</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                                  <li><a href="/dashboard" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Kendraa. All rights reserved. Built for healthcare professionals.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Logo />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
                              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
                <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Stories</a>
                <a href="#faq" className="text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
                              <Link href="/signin" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100/80 backdrop-blur-sm rounded-full border border-emerald-200/50 mb-8">
                <HeartIcon className="w-4 h-4 text-emerald-600 mr-2" />
                <span className="text-sm text-emerald-700 font-medium">Exclusively for Healthcare Professionals</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Global
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"> Medical Community</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Connect with verified doctors, nurses, researchers, and medical professionals worldwide. 
                Share knowledge, advance your career, and collaborate on cases in a secure, HIPAA-compliant environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link 
                  href="/signup" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Try It Out</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link 
                  href="#features" 
                  className="border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  <HeartIcon className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  24/7
                </div>
                <div className="text-gray-600">Medical Support</div>
                <div className="text-xs text-gray-500">Always-on community</div>
              </div>
              <div className="text-center">
                                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                    100%
                  </div>
                <div className="text-gray-600">Verified Professionals</div>
                <div className="text-xs text-gray-500">Licensed & authenticated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  50+
                </div>
                <div className="text-gray-600">Medical Specialties</div>
                <div className="text-xs text-gray-500">All fields covered</div>
              </div>
              <div className="text-center">
                                  <div className="text-3xl font-bold text-accent-600 mb-2">
                    <GlobeAltIcon className="w-8 h-8 mx-auto mb-2 text-accent-600" />
                    Global
                  </div>
                <div className="text-gray-600">Medical Network</div>
                <div className="text-xs text-gray-500">Worldwide connections</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Healthcare Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed specifically for medical professionals, ensuring secure, 
              compliant, and meaningful connections within the global healthcare community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: 'Medical Verification',
                description: 'Every professional is verified with license checks and credential validation. Trust is built into every connection.',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                icon: UserGroupIcon,
                title: 'Specialty Communities',
                description: 'Join exclusive groups for your medical specialty - cardiology, neurology, pediatrics, and 50+ more specialties.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: AcademicCapIcon,
                title: 'CME & Education',
                description: 'Access accredited continuing medical education courses, research papers, and earn certificates directly through the platform.',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: HeartIcon,
                title: 'Anonymous Case Discussions',
                description: 'HIPAA-compliant forums for discussing challenging cases with global experts while maintaining patient privacy.',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: BriefcaseIcon,
                title: 'Medical Career Hub',
                description: 'Find hospital positions, locum opportunities, research fellowships, and pharmaceutical roles from verified healthcare institutions.',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: GlobeAltIcon,
                title: 'Global Tele-Mentoring',
                description: 'Connect with specialists worldwide for virtual mentoring, surgical training, and knowledge exchange sessions.',
                color: 'from-indigo-500 to-indigo-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Join the Future of Medical Collaboration
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Ready to connect with the global medical community? Join thousands of verified healthcare professionals 
              already advancing their careers and sharing knowledge on Kendraa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Sign Up Now</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                href="/signin" 
                                  className="border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                Already Have an Account?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Kendraa</span>
              </div>
              <p className="text-gray-400">
                The world&apos;s premier professional network designed exclusively for healthcare professionals. 
                Secure, verified, and HIPAA-compliant.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Stories</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Kendraa. Empowering healthcare professionals worldwide through secure networking and collaboration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
