'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { EyeIcon, EyeSlashIcon, UserIcon, BuildingOfficeIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PROFILE_TYPES = [
  {
    id: 'individual',
    name: 'Individual',
    description: 'Healthcare professional, researcher, or medical student',
    icon: UserIcon,
    features: ['Professional networking', 'Research collaboration', 'Career opportunities', 'Knowledge sharing'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'institution',
    name: 'Institution',
    description: 'Hospital, university, research center, or healthcare organization',
    icon: BuildingOfficeIcon,
    features: ['Partnership opportunities', 'Talent recruitment', 'Research collaboration', 'Institutional networking'],
    color: 'from-purple-500 to-pink-500'
  },
];

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState<'select' | 'form'>('select');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profileType, setProfileType] = useState<'individual' | 'institution'>('individual');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, user, profile } = useAuth();
  const router = useRouter();

  // Handle redirect after successful signup and profile loading
  useEffect(() => {
    if (user && profile && !loading) {
      // Redirect based on user type
      if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
        if (profile.onboarding_completed) {
          router.push('/institution/feed');
        } else {
          router.push('/institution/onboarding');
        }
      } else {
        if (profile.onboarding_completed) {
          router.push('/feed');
        } else {
          router.push('/onboarding');
        }
      }
    }
  }, [user, profile, loading, router]);

  const handleTypeSelection = (type: 'individual' | 'institution') => {
    setProfileType(type);
    setCurrentStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        profileType
      );
      
      toast.success('Account created successfully!');
      // Redirect will be handled by useEffect when profile is loaded
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setCurrentStep('select');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center items-center mb-8">
          <Logo size="xl" />
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Join the healthcare community
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Choose your account type to get started with the right experience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {PROFILE_TYPES.map((type, index) => {
                  const IconComponent = type.icon;
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => handleTypeSelection(type.id as 'individual' | 'institution')}
                    >
                      <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                        <div className={`w-20 h-20 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {type.name}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {type.description}
                        </p>

                        <div className="space-y-2 mb-6">
                          {type.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-center text-[#007fff] font-semibold group-hover:text-blue-600 transition-colors">
                          <span>Get Started</span>
                          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/signin"
                    className="font-semibold text-[#007fff] hover:text-blue-600 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={goBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  <span>Back to selection</span>
                </button>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${PROFILE_TYPES.find(t => t.id === profileType)?.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {React.createElement(PROFILE_TYPES.find(t => t.id === profileType)?.icon || UserIcon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Create your {profileType} account
                  </h1>
                  <p className="text-gray-600">
                    {profileType === 'institution' 
                      ? 'Connect with healthcare professionals and build institutional partnerships'
                      : 'Join thousands of healthcare professionals'
                    }
                  </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      {profileType === 'institution' ? 'Institution Name' : 'Full Name'}
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fff]/20 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                      placeholder={profileType === 'institution' ? 'Enter your institution name' : 'Enter your full name'}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {profileType === 'institution' ? 'Institution Email' : 'Email Address'}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fff]/20 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                      placeholder={profileType === 'institution' ? 'Enter your institution email' : 'Enter your email'}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fff]/20 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007fff]/20 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-[#007fff] text-white rounded-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating {profileType} account...</span>
                        </div>
                      ) : (
                        `Create ${profileType === 'institution' ? 'Institution' : 'Account'}`
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link
                        href="/signin"
                        className="font-semibold text-[#007fff] hover:text-blue-600 transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}