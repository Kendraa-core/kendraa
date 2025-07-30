'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import LazyImage from '@/components/common/LazyImage';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    redirect('/feed');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-linkedin-light via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl md:text-6xl font-light text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Welcome to your{' '}
                <span className="text-linkedin-primary font-medium">
                  professional
                </span>{' '}
                community
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Connect with healthcare professionals, share insights, and grow your network in a meaningful way.
              </motion.p>
            </div>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="/signup" className="block">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-medium linkedin-gradient hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Join Kendraa
                </Button>
              </Link>
              
              <Link href="/signin" className="block">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  Sign in
                </Button>
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-linkedin-primary rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white text-xl">🤝</span>
                </div>
                <h3 className="font-semibold text-gray-900">Connect</h3>
                <p className="text-sm text-gray-600">Build meaningful professional relationships</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white text-xl">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900">Share</h3>
                <p className="text-sm text-gray-600">Share insights and expertise</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <h3 className="font-semibold text-gray-900">Grow</h3>
                <p className="text-sm text-gray-600">Advance your career</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10">
              <LazyImage
                src="/hero-image.svg"
                alt="Professional networking illustration"
                width={600}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>
            
            {/* Floating Elements */}
            <motion.div
              className="absolute top-10 right-10 w-16 h-16 bg-linkedin-primary rounded-full flex items-center justify-center shadow-lg"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-white text-2xl">👥</span>
            </motion.div>
            
            <motion.div
              className="absolute bottom-20 left-10 w-20 h-20 bg-green-400 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <span className="text-white text-2xl">💼</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-gray-200"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-linkedin-primary">10K+</div>
            <div className="text-sm text-gray-600">Active Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-linkedin-primary">500+</div>
            <div className="text-sm text-gray-600">Healthcare Organizations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-linkedin-primary">50K+</div>
            <div className="text-sm text-gray-600">Connections Made</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-linkedin-primary">98%</div>
            <div className="text-sm text-gray-600">User Satisfaction</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
