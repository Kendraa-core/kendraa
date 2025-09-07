'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { EyeIcon, EyeSlashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PROFILE_TYPES = [
  {
    id: 'individual',
    name: 'Individual',
    description: 'Healthcare professional',
    icon: UserIcon,
  },
  {
    id: 'institution',
    name: 'Institution',
    description: 'Healthcare organization',
    icon: BuildingOfficeIcon,
  },
];

export default function SignUp() {
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
        router.push('/institution/onboarding');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, profile, loading, router]);

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center items-center mb-12">
          <Logo size="xl" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#007fff]/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">
              Join <span className="mulish-semibold">kendraa</span>
            </h1>
            <p className="text-gray-600">
              Connect with healthcare professionals worldwide
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#007fff] mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-[#007fff]/20 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#007fff] mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-[#007fff]/20 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#007fff] mb-4">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PROFILE_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        profileType === type.id
                          ? 'border-[#007fff] bg-[#007fff]/10'
                          : 'border-[#007fff]/20 hover:border-[#007fff]/40'
                      }`}
                      onClick={() => setProfileType(type.id as typeof profileType)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <IconComponent className={`h-8 w-8 mb-3 ${
                          profileType === type.id ? 'text-[#007fff]' : 'text-[#007fff]/40'
                        }`} />
                        <h3 className="text-sm font-medium text-black mb-1">
                          {type.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {type.description}
                        </p>
                      </div>
                      {profileType === type.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-4 h-4 bg-[#007fff] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#007fff] mb-2">
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
                  className="w-full px-4 py-3 pr-12 border border-[#007fff]/20 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-[#007fff]/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[#007fff]/40" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#007fff]/40" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#007fff] mb-2">
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
                  className="w-full px-4 py-3 pr-12 border border-[#007fff]/20 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-[#007fff]/60 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-[#007fff]/40" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-[#007fff]/40" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#007fff] text-white rounded-xl font-medium hover:bg-[#007fff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/signin"
                  className="font-semibold text-[#007fff] hover:text-[#007fff]/80 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 