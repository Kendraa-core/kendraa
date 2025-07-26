'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    redirect('/feed');
  }

  return (
    <div className="min-h-screen bg-[#f3f2f0]">
      <div className="max-w-[1128px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-[#2977c9] mb-8">
              Welcome to your professional community
            </h1>
            <div className="space-y-6">
              <Link
                href="/signin"
                className="block w-full sm:w-96 px-6 py-3 text-gray-700 bg-white rounded-full border border-gray-300 hover:bg-gray-50 text-base font-medium text-center"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block w-full sm:w-96 px-6 py-3 text-white bg-[#0a66c2] rounded-full hover:bg-[#004182] text-base font-medium text-center"
              >
                Join now
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="/hero-image.svg"
              alt="Welcome illustration"
              width={700}
              height={560}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
