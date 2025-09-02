'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BriefcaseIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: UserGroupIcon,
      title: 'Professional Networking',
      description: 'Connect with healthcare professionals worldwide, build meaningful relationships, and expand your professional network.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Knowledge Sharing',
      description: 'Share research, clinical insights, and medical innovations with peers in your specialty.'
    },
    {
      icon: BriefcaseIcon,
      title: 'Career Opportunities',
      description: 'Discover job opportunities, research collaborations, and career advancement possibilities.'
    },
    {
      icon: CalendarIcon,
      title: 'Medical Events',
      description: 'Stay updated with conferences, workshops, and continuing education opportunities.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Secure Messaging',
      description: 'Communicate privately with colleagues through our HIPAA-compliant messaging system.'
    },
    {
      icon: ChartBarIcon,
      title: 'Professional Analytics',
      description: 'Track your professional growth, network expansion, and engagement metrics.'
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
    { number: '10,000+', label: 'Healthcare Professionals' },
    { number: '50+', label: 'Medical Specialties' },
    { number: '100+', label: 'Countries' },
    { number: '1M+', label: 'Professional Connections' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-primary-600 mulish-semibold">kendraa</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              The premier networking platform for healthcare professionals, designed to foster collaboration, 
              knowledge sharing, and career growth in the medical community.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-600">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              To revolutionize healthcare collaboration by providing a secure, innovative platform where medical 
              professionals can connect, share knowledge, and advance their careers while ultimately improving 
              patient care worldwide.
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
                <span className="mulish-semibold">kendraa</span> was born from the recognition that healthcare professionals need better tools to connect, 
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the tools and features designed specifically for healthcare professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-[#007fff] mb-4" />
                <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at <span className="mulish-semibold">kendraa</span>
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
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-[#007fff]" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">Our Team</h2>
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
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-10 h-10 text-[#007fff]" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Healthcare Experts</h3>
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
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-10 h-10 text-[#007fff]" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Technology Innovators</h3>
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
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-10 h-10 text-[#007fff]" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Global Community</h3>
              <p className="text-gray-600 text-sm">
                Representatives from diverse healthcare systems worldwide ensuring global relevance
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#007fff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Join the Future of Healthcare Networking</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with healthcare professionals worldwide, share knowledge, and advance your career 
              in the medical community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-[#007fff] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Today
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#007fff] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
