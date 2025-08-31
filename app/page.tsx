'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const isClient = useIsClient();
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirect logged-in users to feed
  useEffect(() => {
    if (isClient && user) {
      router.push('/feed');
    }
  }, [isClient, user, router]);

  // Show loading while checking authentication
  if (!isClient || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-600 mt-4 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Medical Verification',
      description: 'Every professional is verified with license checks and credential validation. Trust is built into every connection.',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Specialty Communities',
      description: 'Join exclusive groups for your medical specialty - cardiology, neurology, pediatrics, and 50+ more specialties.',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: AcademicCapIcon,
      title: 'CME & Education',
      description: 'Access accredited continuing medical education courses, research papers, and earn certificates directly through the platform.',
      color: 'from-accent-500 to-accent-600'
    },
    {
      icon: HeartIcon,
      title: 'Anonymous Case Discussions',
      description: 'HIPAA-compliant forums for discussing challenging cases with global experts while maintaining patient privacy.',
      color: 'from-primary-500 to-secondary-600'
    },
    {
      icon: BriefcaseIcon,
      title: 'Medical Career Hub',
      description: 'Find hospital positions, locum opportunities, research fellowships, and pharmaceutical roles from verified healthcare institutions.',
      color: 'from-secondary-500 to-accent-600'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Tele-Mentoring',
      description: 'Connect with specialists worldwide for virtual mentoring, surgical training, and knowledge exchange sessions.',
      color: 'from-accent-500 to-primary-600'
    }
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'Patient-Centric',
      description: 'Everything we do is ultimately focused on improving patient care and outcomes.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Security',
      description: 'Your data and communications are protected with enterprise-grade security measures.'
    },
    {
      icon: SparklesIcon,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge tools for healthcare professionals.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Collaboration',
      description: 'Breaking down geographical barriers to foster international medical collaboration.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Healthcare Professionals', icon: UserGroupIcon },
    { number: '50+', label: 'Medical Specialties', icon: AcademicCapIcon },
    { number: '100+', label: 'Countries', icon: GlobeAltIcon },
    { number: '1M+', label: 'Professional Connections', icon: HeartIcon }
  ];

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center">
                <Logo size="xl" />
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <a href="#about" className="text-base text-gray-600 hover:text-primary-600 transition-colors">About</a>
                <a href="#features" className="text-base text-gray-600 hover:text-primary-600 transition-colors">Features</a>
                <a href="#values" className="text-base text-gray-600 hover:text-primary-600 transition-colors">Values</a>
                <a href="#team" className="text-base text-gray-600 hover:text-primary-600 transition-colors">Team</a>
              </nav>

              <div className="flex items-center space-x-4">
                <Link href="/signin" className="text-base text-gray-600 hover:text-primary-600 transition-colors">
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
              <div className="inline-flex items-center px-4 py-2 bg-primary-100/80 backdrop-blur-sm rounded-full border border-primary-200/50 mb-8">
                <HeartIcon className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm text-primary-700 font-medium">Exclusively for Healthcare Professionals</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Global
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Medical Community</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Connect with verified doctors, nurses, researchers, and medical professionals worldwide. 
                Share knowledge, advance your career, and collaborate on cases in a secure, HIPAA-compliant environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link 
                  href="/signup" 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link 
                  href="#about" 
                  className="border-2 border-gray-300 hover:border-primary-600 text-gray-700 hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                About <span className="text-primary-600">Kendraa</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                The premier networking platform for healthcare professionals, designed to foster collaboration, 
                knowledge sharing, and career growth in the medical community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Empowering Healthcare Professionals</h3>
                <p className="text-gray-600 mb-6">
                  Kendraa was born from the recognition that healthcare professionals need better tools to connect, 
                  collaborate, and grow in their careers. We understand the unique challenges faced by doctors, 
                  nurses, researchers, and healthcare administrators.
                </p>
                <p className="text-gray-600 mb-6">
                  Our platform combines the power of social networking with specialized features designed specifically 
                  for the medical community, ensuring that every interaction contributes to professional development 
                  and improved patient care.
                </p>
                <Link 
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Join Our Community
                </Link>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <HeartIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Patient Care</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <AcademicCapIcon className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Education</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <UserGroupIcon className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Collaboration</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <SparklesIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">Innovation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
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
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section id="values" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do at Kendraa
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A dedicated team of healthcare professionals, technologists, and innovators committed to 
                transforming healthcare collaboration
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Healthcare Experts</h3>
                <p className="text-gray-600 text-sm">
                  Medical professionals with decades of experience in clinical practice and healthcare administration
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-10 h-10 text-secondary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Technology Innovators</h3>
                <p className="text-gray-600 text-sm">
                  Engineers and designers creating cutting-edge solutions for healthcare professionals
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GlobeAltIcon className="w-10 h-10 text-accent-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Community</h3>
                <p className="text-gray-600 text-sm">
                  Representatives from diverse healthcare systems worldwide ensuring global relevance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join the Future of Medical Collaboration
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Ready to connect with the global medical community? Join thousands of verified healthcare professionals 
              already advancing their careers and sharing knowledge on Kendraa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="bg-azure-600 text-white hover:bg-azure-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                href="/signin" 
                className="bg-azure-600 text-white hover:bg-azure-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              >
                Already Have an Account?
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-6">
                  <Logo size="xl" />
                </div>
                <p className="text-gray-400 mb-4">
                  The world&apos;s premier professional network designed exclusively for healthcare professionals. 
                  Secure, verified, and HIPAA-compliant.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-white">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                  <li><a href="#values" className="hover:text-primary-400 transition-colors">Values</a></li>
                  <li><a href="#team" className="hover:text-primary-400 transition-colors">Team</a></li>
                  <li><a href="/about" className="hover:text-primary-400 transition-colors">About Us</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-white">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                  <li><a href="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
                  <li><a href="/compliance" className="hover:text-primary-400 transition-colors">HIPAA Compliance</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-white">Connect</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                  <li><a href="/support" className="hover:text-primary-400 transition-colors">Support</a></li>
                  <li><a href="/feedback" className="hover:text-primary-400 transition-colors">Feedback</a></li>
                  <li><a href="/partnerships" className="hover:text-primary-400 transition-colors">Partnerships</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>© 2025 Kendraa. Empowering healthcare professionals worldwide through secure networking and collaboration. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <Logo size="xl" />
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#values" className="text-gray-600 hover:text-primary-600 transition-colors">Values</a>
              <a href="#team" className="text-gray-600 hover:text-primary-600 transition-colors">Team</a>
            </nav>

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
              <div className="inline-flex items-center px-4 py-2 bg-primary-100/80 backdrop-blur-sm rounded-full border border-primary-200/50 mb-8">
                <HeartIcon className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm text-primary-700 font-medium">Exclusively for Healthcare Professionals</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Global
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Medical Community</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Connect with verified doctors, nurses, researchers, and medical professionals worldwide. 
                Share knowledge, advance your career, and collaborate on cases in a secure, HIPAA-compliant environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link 
                  href="/signup" 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link 
                  href="#about" 
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
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About <span className="text-primary-600">Kendraa</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              The premier networking platform for healthcare professionals, designed to foster collaboration, 
              knowledge sharing, and career growth in the medical community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Empowering Healthcare Professionals</h3>
              <p className="text-gray-600 mb-6">
                Kendraa was born from the recognition that healthcare professionals need better tools to connect, 
                collaborate, and grow in their careers. We understand the unique challenges faced by doctors, 
                nurses, researchers, and healthcare administrators.
              </p>
              <p className="text-gray-600 mb-6">
                Our platform combines the power of social networking with specialized features designed specifically 
                for the medical community, ensuring that every interaction contributes to professional development 
                and improved patient care.
              </p>
              <Link 
                href="/signup"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Join Our Community
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <HeartIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Patient Care</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <AcademicCapIcon className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Education</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <UserGroupIcon className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Collaboration</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <SparklesIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Innovation</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Healthcare Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed specifically for medical professionals, ensuring secure, 
              compliant, and meaningful connections within the global healthcare community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
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

      {/* Values Section */}
      <section id="values" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Kendraa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A dedicated team of healthcare professionals, technologists, and innovators committed to 
              transforming healthcare collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 text-center shadow-sm"
            >
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Healthcare Experts</h3>
              <p className="text-gray-600 text-sm">
                Medical professionals with decades of experience in clinical practice and healthcare administration
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 text-center shadow-sm"
            >
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-10 h-10 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Technology Innovators</h3>
              <p className="text-gray-600 text-sm">
                Engineers and designers creating cutting-edge solutions for healthcare professionals
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 text-center shadow-sm"
            >
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-10 h-10 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Community</h3>
              <p className="text-gray-600 text-sm">
                Representatives from diverse healthcare systems worldwide ensuring global relevance
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Join the Future of Medical Collaboration
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Ready to connect with the global medical community? Join thousands of verified healthcare professionals 
              already advancing their careers and sharing knowledge on Kendraa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                href="/signin" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
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
              <div className="flex items-center mb-6">
                <Logo size="xl" />
              </div>
              <p className="text-gray-400 mb-4">
                The world&apos;s premier professional network designed exclusively for healthcare professionals. 
                Secure, verified, and HIPAA-compliant.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#values" className="hover:text-primary-400 transition-colors">Values</a></li>
                <li><a href="#team" className="hover:text-primary-400 transition-colors">Team</a></li>
                <li><a href="/about" className="hover:text-primary-400 transition-colors">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
                <li><a href="/compliance" className="hover:text-primary-400 transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="/support" className="hover:text-primary-400 transition-colors">Support</a></li>
                <li><a href="/feedback" className="hover:text-primary-400 transition-colors">Feedback</a></li>
                <li><a href="/partnerships" className="hover:text-primary-400 transition-colors">Partnerships</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Kendraa. Empowering healthcare professionals worldwide through secure networking and collaboration. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
