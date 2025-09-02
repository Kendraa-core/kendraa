'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import toast from 'react-hot-toast';
import { getSupabase } from '@/lib/queries';

export default function VerifyOtp() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      toast.error('No email provided. Please start over.');
      router.push('/forgot-password');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim() || token.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await getSupabase().auth.verifyOtp({
        email: email,
        token: token,
        type: 'email', 
      });

      if (error) {
        throw error;
      }

      toast.success('Verification successful!');
      router.push('/reset-password');

    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="token"
                name="token"
                type="text"
                maxLength={6}
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full text-center tracking-[1em] px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors placeholder:text-gray-400"
                placeholder="------"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || token.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-azure-600 hover:bg-azure-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azure-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify and Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

