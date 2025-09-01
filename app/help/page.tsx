'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const helpCategories = [
  {
    title: 'Getting Started',
    icon: AcademicCapIcon,
    items: [
      'How to create your medical profile',
      'Completing your professional information',
      'Adding medical specializations',
      'Setting up your institution profile'
    ]
  },
  {
    title: 'Profile & Privacy',
    icon: ShieldCheckIcon,
    items: [
      'Managing your profile visibility',
      'Privacy settings and controls',
      'Verification process for medical professionals',
      'Data security and protection'
    ]
  },
  {
    title: 'Networking & Connections',
    icon: UserGroupIcon,
    items: [
      'Connecting with healthcare professionals',
      'Following medical institutions',
      'Building your professional network',
      'Managing connection requests'
    ]
  },
  {
    title: 'Account Settings',
    icon: CogIcon,
    items: [
      'Updating account information',
      'Notification preferences',
      'Password and security settings',
      'Deactivating your account'
    ]
  }
];

const faqs = [
  {
    question: 'How do I verify my medical credentials?',
    answer: 'Upload your medical license or certification documents in your profile settings. Our verification team will review and approve within 24-48 hours.'
  },
  {
    question: 'Can I connect with professionals outside my specialization?',
    answer: 'Yes! Kendraa encourages interdisciplinary connections. You can connect with any healthcare professional on the platform.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Absolutely. We use enterprise-grade security measures and comply with healthcare data protection standards to keep your information safe.'
  },
  {
    question: 'How do I report inappropriate content or behavior?',
    answer: 'Use the report button on any post or profile, or contact our support team directly. We take all reports seriously and investigate promptly.'
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <QuestionMarkCircleIcon className="w-20 h-20 text-[#007fff] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get the support you need to make the most of your Kendraa experience.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-6 py-4 border-2 border-[#007fff]/20 rounded-2xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white text-lg transition-all duration-200"
            />
            <button className="absolute right-2 top-2 px-6 py-2 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors">
              Search
            </button>
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {helpCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-[#007fff]/10 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#007fff]/10 rounded-xl flex items-center justify-center mr-4">
                  <category.icon className="w-6 h-6 text-[#007fff]" />
                </div>
                <h3 className="text-xl font-bold text-black">{category.title}</h3>
              </div>
              <ul className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <button className="text-gray-600 hover:text-[#007fff] transition-colors text-left">
                      • {item}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-[#007fff]/10 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-black mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl border border-[#007fff]/10 p-8 shadow-lg text-center"
        >
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-[#007fff] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-black mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our support team is here to help you with any questions or issues you may have.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link 
              href="/contact"
              className="flex items-center justify-center px-6 py-4 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-200 font-medium"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              Contact Support
            </Link>
            <button className="flex items-center justify-center px-6 py-4 bg-white text-[#007fff] border-2 border-[#007fff]/20 rounded-xl hover:border-[#007fff]/40 hover:bg-[#007fff]/5 transition-all duration-200 font-medium">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Submit Ticket
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
