'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getSupabase } from '@/lib/queries';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();

  // This hook confirms that a session exists, which should have been
  // created by the successful OTP verification step.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        toast.error('No valid session. Please start the password reset process again.');
        router.push('/forgot-password');
      }
    };
    
    checkSession();
  }, [router]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Use the existing session to update the user's password
      const { error } = await getSupabase().auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      toast.success('Password updated successfully!');
      
      // Sign out to invalidate the session for security
      await getSupabase().auth.signOut();
      
      setTimeout(() => {
        router.push('/signin');
      }, 3000);

    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-bold text-black">
              Validating session...
            </h2>
            <div className="mt-4">
              <div className="w-8 h-8 border-2 border-[#007fff] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-bold text-black">
              Password updated!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully updated.
            </p>
          </div>
          <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#007fff]/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#007fff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                You will be redirected to the sign in page in a few seconds...
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/signin"
                className="w-full flex justify-center py-2 px-4 border border-[#007fff]/20 rounded-lg shadow-sm text-sm font-medium text-[#007fff] bg-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] transition-colors"
              >
                Sign in now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold text-black">
            Set new password
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#007fff] mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-[#007fff]/20 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-[#007fff] transition-colors placeholder:text-gray-400"
                  placeholder="Enter your new password"
                  disabled={loading}
                />
                 <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#007fff] mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-[#007fff]/20 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-[#007fff] transition-colors placeholder:text-gray-400"
                  placeholder="Confirm your new password"
                  disabled={loading}
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                disabled={loading || !password || !confirmPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#007fff] hover:bg-[#007fff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update password'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#007fff]/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/signin"
                className="w-full flex justify-center py-2 px-4 border border-[#007fff]/20 rounded-lg shadow-sm text-sm font-medium text-[#007fff] bg-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

