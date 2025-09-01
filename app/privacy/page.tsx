'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  LockClosedIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const privacyPrinciples = [
  {
    icon: ShieldCheckIcon,
    title: 'Data Protection',
    description: 'We use industry-standard encryption and security measures to protect your personal and medical information.'
  },
  {
    icon: EyeSlashIcon,
    title: 'Privacy Control',
    description: 'You control who sees your information and can adjust privacy settings at any time.'
  },
  {
    icon: LockClosedIcon,
    title: 'Secure Storage',
    description: 'All data is stored in secure, HIPAA-compliant data centers with regular security audits.'
  },
  {
    icon: UserGroupIcon,
    title: 'Limited Sharing',
    description: 'We never sell your data and only share information with your explicit consent.'
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <ShieldCheckIcon className="w-20 h-20 text-[#007fff] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy and data security are our top priorities. Learn how we protect and handle your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 1, 2025
          </p>
        </motion.div>

        {/* Privacy Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {privacyPrinciples.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-[#007fff]/10 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#007fff]/10 rounded-xl flex items-center justify-center mr-4">
                  <principle.icon className="w-6 h-6 text-[#007fff]" />
                </div>
                <h3 className="text-lg font-bold text-black">{principle.title}</h3>
              </div>
              <p className="text-gray-600">{principle.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Privacy Policy Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#007fff]/10 p-8 shadow-lg space-y-8"
        >
          
          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 text-[#007fff] mr-3" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                complete your medical professional profile, or communicate with us. This may include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal information (name, email, phone number)</li>
                <li>Professional information (medical license, specialization, work history)</li>
                <li>Educational background and certifications</li>
                <li>Profile content and posts you create</li>
                <li>Communication preferences and settings</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <LockClosedIcon className="w-6 h-6 text-[#007fff] mr-3" />
              How We Use Your Information
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Verify medical credentials and professional status</li>
                <li>Connect you with relevant healthcare professionals</li>
                <li>Send you important updates and communications</li>
                <li>Ensure platform safety and security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <UserGroupIcon className="w-6 h-6 text-[#007fff] mr-3" />
              Information Sharing
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>To protect our rights and safety</li>
                <li>With trusted service providers under strict confidentiality agreements</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <EyeSlashIcon className="w-6 h-6 text-[#007fff] mr-3" />
              Your Privacy Rights
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access, update, or delete your personal information</li>
                <li>Control who can see your profile and information</li>
                <li>Opt out of non-essential communications</li>
                <li>Request a copy of your data</li>
                <li>Restrict or object to certain processing activities</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-[#007fff] mr-3" />
              Data Security
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>End-to-end encryption for sensitive data</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <GlobeAltIcon className="w-6 h-6 text-[#007fff] mr-3" />
              International Data Transfers
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                As a global platform serving healthcare professionals worldwide, we may transfer 
                your information across borders. We ensure appropriate safeguards are in place 
                for all international transfers, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Adequacy decisions by relevant authorities</li>
                <li>Standard contractual clauses</li>
                <li>Binding corporate rules</li>
                <li>Explicit consent where required</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-[#007fff] mr-3" />
              Changes to This Policy
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page and updating the 
                "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </div>
          </section>

        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#007fff]/10 rounded-2xl p-8 text-center mt-12"
        >
          <CheckCircleIcon className="w-12 h-12 text-[#007fff] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-4">Questions About Your Privacy?</h3>
          <p className="text-gray-600 mb-6">
            If you have any questions about this privacy policy or how we handle your data, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium"
            >
              Contact Privacy Team
            </Link>
            <button className="px-6 py-3 bg-white text-[#007fff] border-2 border-[#007fff]/20 rounded-xl hover:border-[#007fff]/40 hover:bg-[#007fff]/5 transition-all duration-200 font-medium">
              Download Policy PDF
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
