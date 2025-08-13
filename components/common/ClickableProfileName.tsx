'use client';

import React from 'react';
import Link from 'next/link';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ClickableProfileNameProps {
  userId: string;
  name: string;
  userType?: 'individual' | 'institution';
  showBadge?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function ClickableProfileName({
  userId,
  name,
  userType = 'individual',
  showBadge = true,
  className,
  children
}: ClickableProfileNameProps) {
  return (
    <Link
      href={`/profile/${userId}`}
      className={cn(
        'font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer inline-flex items-center space-x-1',
        className
      )}
    >
      <span>{children || name}</span>
      {showBadge && userType === 'institution' && (
        <CheckBadgeIcon className="w-4 h-4 text-blue-600" />
      )}
    </Link>
  );
} 