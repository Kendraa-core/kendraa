'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  // Check if user has a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await getSupabase().auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          toast.error('Invalid or expired reset link. Please request a new one.');
          router.push('/forgot-password');
          return;
        }

        if (!session) {
          toast.error('Invalid or expired reset link. Please request a new one.');
          router.push('/forgot-password');
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Invalid or expired reset link. Please request a new one.');
        router.push('/forgot-password');
      }
    };

    checkSession();
  }, [router]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidSession) {
      toast.error('Invalid session. Please request a new reset link.');
      return;
    }

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
      const { error } = await getSupabase().auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      setSuccess(true);
      toast.success('Password updated successfully!');
      
      // Sign out the user after password change
      await getSupabase().auth.signOut();
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (error: any) {
      console.error('Password update error:', error);
      
      // Handle specific Supabase errors
      if (error.message?.includes('Password should be at least')) {
        toast.error('Password is too weak. Please choose a stronger password.');
      } else if (error.message?.includes('Invalid JWT')) {
        toast.error('Invalid or expired reset link. Please request a new one.');
        router.push('/forgot-password');
      } else {
        toast.error(error.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Validating reset link...
            </h2>
            <div className="mt-4">
              <div className="w-8 h-8 border-2 border-azure-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Password updated!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully updated
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-azure-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-azure-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azure-500 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors placeholder:text-gray-400"
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
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors placeholder:text-gray-400"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-azure-600 hover:bg-azure-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azure-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/signin"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azure-500 transition-colors"
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
