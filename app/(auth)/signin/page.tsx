'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      toast.loading('Signing in...', { id: 'signin' });
      await signIn(email, password);
      router.push('/feed');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in', { id: 'signin' });
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
              Welcome back
            </h1>
            <p className="text-gray-600">
              Sign in to your account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#007fff]/20 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Email"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-[#007fff]/20 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#007fff]/40 hover:text-[#007fff]/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-[#007fff] hover:text-[#007fff]/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#007fff] text-white rounded-xl font-medium hover:bg-[#007fff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600">New to Kendraa?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6">
              <Link
                href="/signup"
                className="w-full flex justify-center py-3 px-4 border border-[#007fff]/20 rounded-xl text-[#007fff] font-medium hover:bg-[#007fff]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] transition-all duration-200"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 