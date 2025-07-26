'use client';

import React from 'react';
import Image from 'next/image';

export default function PremiumCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 text-center">
        <h2 className="text-lg font-medium mb-1">Try Premium for free</h2>
        <p className="text-sm text-gray-500 mb-4">One month free</p>
        <div className="relative h-32 mb-4">
          <Image
            src="/premium-illustration.png"
            alt="Premium features illustration"
            fill
            className="object-contain"
          />
        </div>
        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 font-medium hover:opacity-90 transition-opacity">
          Try free
        </button>
      </div>
    </div>
  );
} 