'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackClassName?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  className,
  fallbackClassName 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = cn(
    'relative rounded-full overflow-hidden flex items-center justify-center',
    sizeClasses[size],
    className
  );

  if (!src || imageError) {
    return (
      <div 
        className={cn(
          baseClasses,
          'bg-[#007fff] text-white font-semibold',
          fallbackClassName
        )}
      >
        {getInitials(alt)}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#007fff] text-white font-semibold flex items-center justify-center">
          {getInitials(alt)}
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-opacity duration-200',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        sizes={
          size === 'xs' ? '24px' :
          size === 'sm' ? '32px' :
          size === 'md' ? '40px' :
          size === 'lg' ? '48px' :
          size === 'xl' ? '64px' :
          '80px'
        }
      />
    </div>
  );
} 