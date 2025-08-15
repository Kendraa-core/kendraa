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
  BuildingOfficeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const isClient = useIsClient();
  
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
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-2">
                <Logo />
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
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Logo />
                <p className="mt-4 text-gray-400">
                  The world&apos;s premier professional network designed exclusively for healthcare professionals. 
                  Secure, verified, and HIPAA-compliant.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#values" className="hover:text-white transition-colors">Values</a></li>
                  <li><a href="#team" className="hover:text-white transition-colors">Team</a></li>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Logo />
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
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
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
                <li><a href="#values" className="hover:text-white transition-colors">Values</a></li>
                <li><a href="#team" className="hover:text-white transition-colors">Team</a></li>
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
