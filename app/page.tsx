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
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';

const features = [
  {
    icon: StarSolidIcon,
    title: 'AI That Works for You',
    description: 'Match beyond keywords - connect through real compatibility.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Smarter Scheduling',
    description: 'AI handles logistics so you can focus on networking.',
  },
  {
    icon: UserGroupIcon,
    title: 'Exclusive Lounges',
    description: 'Join curated spaces where meaningful discussions happen.',
  },
  {
    icon: UserGroupIcon,
    title: 'Real Connections',
    description: 'Break away from the scroll - engage with like-minded professionals.',
  },
];

const stats = [
  { number: '100k+', label: 'AI-powered connections made' },
  { number: '95%', label: 'Match accuracy rate' },
  { number: '5M+', label: 'Messages exchanged' },
  { number: '85%', label: 'Users prefer SmartLync' },
];

const testimonials = [
  {
    name: 'Sophia T.',
    title: 'Partnerships Lead, HubSpot',
    quote: 'SmartLync transformed how I network. The AI matching is incredibly accurate.',
    avatar: 'ST',
  },
  {
    name: 'James R.',
    title: 'Startup Founder & CEO',
    quote: 'Finally, a platform that understands what real networking should be.',
    avatar: 'JR',
  },
  {
    name: 'Rina L.',
    title: 'Senior UX Designer, Google',
    quote: 'The exclusive lounges feature is game-changing for meaningful connections.',
    avatar: 'RL',
  },
  {
    name: 'Lisa M.',
    title: 'Senior Software Engineer, Notion',
    quote: 'Smart scheduling saves me hours every week. Highly recommend!',
    avatar: 'LM',
  },
  {
    name: 'Chris B.',
    title: 'Data Scientist, Shopify',
    quote: 'The AI matching is spot-on. I&apos;ve made more valuable connections here than anywhere else.',
    avatar: 'CB',
  },
  {
    name: 'Amanda K.',
    title: 'Creative Director, Adobe',
    quote: 'SmartLync understands the difference between networking and noise.',
    avatar: 'AK',
  },
];

const pricingPlans = [
  {
    name: 'Free Plan',
    price: '$0',
    period: '/month',
    features: [
      'AI matchmaking (standard)',
      'Access to 5 industry lounges',
      '10 messages per day',
      'Basic scheduling (limited slots)',
      'Join public events',
      'Community support',
    ],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'SmartLync Pro',
    price: '$15',
    period: '/month',
    features: [
      'Advanced AI matchmaking',
      'Unlimited industry lounges',
      'Unlimited messaging',
      'Smart scheduling',
      'Priority event access',
      'Email support',
    ],
    buttonText: 'Get SmartLync Pro',
    popular: true,
  },
];

const faqs = [
  {
    question: 'How does SmartLync match with the right people?',
    answer: 'SmartLync uses advanced AI to analyze your industry, interests, and networking goals, ensuring every connection is relevant and valuable.',
  },
  {
    question: 'Is SmartLync free to use?',
    answer: 'Yes, SmartLync offers a free plan with basic features. For advanced features, we offer SmartLync Pro at $15/month.',
  },
  {
    question: 'Can I control who I connect with?',
    answer: 'Absolutely. You have full control over your connections and can choose who to engage with.',
  },
  {
    question: 'How secure is my data on SmartLync?',
    answer: 'We prioritize your privacy and security. All data is encrypted and we never share your information with third parties.',
  },
  {
    question: 'Does SmartLync support event-based networking?',
    answer: 'Yes, SmartLync integrates with various event platforms and helps you connect with attendees before, during, and after events.',
  },
];

const trustedCompanies = [
  'Google', 'HubSpot', 'Microsoft', 'Zoom', 'Slack', 'NVIDIA', 'LinkedIn'
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <StarIcon className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold text-white">SmartLync</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-gray-300 hover:text-white transition-colors">
                FAQs
              </Link>
            </nav>

            {/* CTA Button */}
            <Link
              href="/signup"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Future of Networking Starts{' '}
              <span className="text-purple-500">Here</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered, real-time matchmaking that connects you with professionals who truly align with your goals.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
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
                  className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-purple-500/30 relative"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">Trusted By 50+ Companies Worldwide</h2>
          <div className="flex justify-center items-center space-x-12 opacity-50">
            {trustedCompanies.map((company) => (
              <div key={company} className="text-gray-400 font-semibold">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Designed for{' '}
              <span className="text-purple-500">Smarter Connections</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              With SmartLync, connecting with the right people is effortless, ensuring every interaction has real value.
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
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">SmartLync by the Numbers</h2>
            <p className="text-xl text-gray-300">A glance at how SmartLync is revolutionizing networking.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-purple-500 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">What our Users Say</h2>
            <p className="text-xl text-gray-300">Real users, real connections. See what they&apos;re saying.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.title}</div>
                  </div>
                </div>
                <p className="text-gray-300">&quot;{testimonial.quote}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Flexible Plans for Every{' '}
              <span className="text-purple-500">Professional</span>
            </h2>
            <p className="text-xl text-gray-300">Whatever your networking goals, SmartLync has a plan tailored for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gray-800 rounded-xl p-8 ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-purple-500 mr-3" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-700 rounded-lg"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-600 transition-colors rounded-lg"
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-300">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Network Smarter, Connect Better</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of professionals using AI-powered networking to build real connections.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started For Free
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <StarIcon className="w-6 h-6 text-purple-500" />
                <span className="text-xl font-bold text-white">SmartLync</span>
              </div>
              <p className="text-gray-400">Smarter networking, powered by AI.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <div className="space-y-2">
                <Link href="#features" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="block text-gray-400 hover:text-white transition-colors">
                  Testimonials
                </Link>
                <Link href="#pricing" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#faq" className="block text-gray-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect with us</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">in</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">X</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">D</span>
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">💬</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            © 2025 SmartLync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
