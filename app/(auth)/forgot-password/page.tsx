'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import toast from 'react-hot-toast';
import { getSupabase } from '@/lib/queries';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Use signInWithOtp to send a code instead of a link
      const { error } = await getSupabase().auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Don't create a new user if one doesn't exist
        },
      });

      if (error) {
        console.error('OTP send error:', error);
        if (error.message.toLowerCase().includes('user not found')) {
           toast.error('No account found with this email address.');
        } else {
           throw error;
        }
      } else {
        toast.success('A verification code has been sent to your email.');
        // Redirect to the new OTP verification page, passing the email along
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      console.error('OTP send error:', error);
      toast.error(error.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold text-black">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a verification code.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#007fff] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#007fff]/20 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#007fff]/10 focus:border-[#007fff] transition-colors placeholder:text-gray-400"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#007fff] hover:bg-[#007fff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007fff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signin"
              className="font-medium text-azure-600 hover:text-azure-500"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

