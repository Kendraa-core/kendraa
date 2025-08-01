'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRightIcon,
  StarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  SparklesIcon as SparklesSolidIcon,
} from '@heroicons/react/24/solid';

const features = [
  {
    icon: SparklesSolidIcon,
    title: 'Intelligent Matching',
    description: 'Connect with healthcare professionals who share your expertise and goals.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Seamless Scheduling',
    description: 'Coordinate meetings and consultations with built-in calendar integration.',
  },
  {
    icon: UserGroupIcon,
    title: 'Professional Networks',
    description: 'Join specialty-focused communities for meaningful collaboration.',
  },
  {
    icon: StarSolidIcon,
    title: 'Verified Connections',
    description: 'Build trust with verified healthcare professionals worldwide.',
  },
];

const stats = [
  { number: '50K+', label: 'Healthcare professionals' },
  { number: '98%', label: 'Satisfaction rate' },
  { number: '2M+', label: 'Successful connections' },
  { number: '95%', label: 'User recommendation rate' },
];

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    title: 'Cardiothoracic Surgeon, Johns Hopkins',
    quote: 'Kendraa connects me with the right specialists. The matching is precise and valuable.',
    avatar: 'SC',
  },
  {
    name: 'Dr. Michael Rodriguez',
    title: 'Emergency Medicine, Mayo Clinic',
    quote: 'A platform that understands healthcare professionals. Simple, effective, professional.',
    avatar: 'MR',
  },
  {
    name: 'Dr. Emily Thompson',
    title: 'Research Director, Harvard Medical',
    quote: 'The networking features enable meaningful medical collaborations.',
    avatar: 'ET',
  },
  {
    name: 'Dr. Lisa Martinez',
    title: 'Pediatrician, Stanford Health',
    quote: 'Scheduling tools save me hours every week. Highly recommended.',
    avatar: 'LM',
  },
  {
    name: 'Dr. Chris Brown',
    title: 'Neurologist, Cleveland Clinic',
    quote: 'The matching algorithm is accurate. I\'ve made valuable connections here.',
    avatar: 'CB',
  },
  {
    name: 'Dr. Amanda Kim',
    title: 'Oncologist, MD Anderson',
    quote: 'Kendraa focuses on real professional relationships, not just networking.',
    avatar: 'AK',
  },
];

const pricingPlans = [
  {
    name: 'Professional',
    price: '$0',
    period: '/month',
    features: [
      'Basic matching algorithm',
      'Access to 5 specialty networks',
      '10 connection requests per day',
      'Standard scheduling tools',
      'Community access',
      'Email support',
    ],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$29',
    period: '/month',
    features: [
      'Advanced matching algorithm',
      'Unlimited specialty networks',
      'Unlimited connections',
      'Advanced scheduling',
      'Priority event access',
      'Dedicated support',
    ],
    buttonText: 'Get Premium',
    popular: true,
  },
];

const faqs = [
  {
    question: 'How does Kendraa match healthcare professionals?',
    answer: 'Kendraa analyzes your specialty, experience, and professional interests to connect you with relevant healthcare professionals who can add value to your practice.',
  },
  {
    question: 'Is Kendraa free to use?',
    answer: 'Yes, Kendraa offers a free plan with essential features. Premium features are available for $29/month.',
  },
  {
    question: 'Can I control my connections?',
    answer: 'Yes, you have complete control over your connections and can choose who to engage with based on your professional criteria.',
  },
  {
    question: 'How secure is my data on Kendraa?',
    answer: 'We prioritize your privacy and security. All data is encrypted and we never share your information with third parties.',
  },
  {
    question: 'Does Kendraa support medical events?',
    answer: 'Yes, Kendraa integrates with medical event platforms and helps you connect with attendees before, during, and after events.',
  },
];

const trustedInstitutions = [
  'Johns Hopkins', 'Mayo Clinic', 'Harvard Medical', 'Stanford Health', 'Cleveland Clinic', 'MD Anderson', 'UCLA Health'
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Kendraa</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                FAQs
              </Link>
            </nav>

            {/* CTA Button */}
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Connect Healthcare Professionals
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Intelligent networking platform that connects healthcare professionals with meaningful opportunities and collaborations.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started for Free
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>

          {/* Network Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="flex justify-center items-center space-x-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-200 relative shadow-md"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900">Trusted By Leading Medical Institutions</h2>
          <div className="flex justify-center items-center space-x-12 text-gray-600">
            {trustedInstitutions.map((institution) => (
              <div key={institution} className="font-medium">
                {institution}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Designed for Professional Connections
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kendraa makes connecting with the right healthcare professionals simple and effective.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Kendraa by the Numbers</h2>
            <p className="text-xl text-gray-600">How Kendraa is transforming healthcare networking.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">What Healthcare Professionals Say</h2>
            <p className="text-xl text-gray-600">Real professionals, real connections.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.title}</div>
                  </div>
                </div>
                <p className="text-gray-600">&quot;{testimonial.quote}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Plans for Every Professional
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your networking needs.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-xl p-8 border ${
                  plan.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                } shadow-sm`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Join Healthcare Professionals</h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect with thousands of healthcare professionals using intelligent networking.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started For Free
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Kendraa</span>
              </div>
              <p className="text-gray-600">Professional networking for healthcare.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Navigation</h3>
              <div className="space-y-2">
                <Link href="#features" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  Testimonials
                </Link>
                <Link href="#pricing" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
                <Link href="#faq" className="block text-gray-600 hover:text-blue-600 transition-colors">
                  FAQs
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Connect with us</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">in</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">X</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">D</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">💬</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            © 2025 Kendraa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
