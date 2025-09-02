'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'simple' | 'text-only';
}

export default function Logo({ 
  className = '', 
  size = 'md', 
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-32 w-auto',
    md: 'h-40 w-auto',
    lg: 'h-48 w-auto',
    xl: 'h-56 w-auto'
  };

  // If text-only variant, use CSS-based text
  if (variant === 'text-only') {
    return <LogoText className={className} size={size} variant={variant} />;
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center`}>
      <Image
        src="/Kendraa Logo (1).png"
        alt="Kendraa - Healthcare Professional Networking"
        width={1000}
        height={240}
        className="h-full w-auto object-contain"
        priority
      />
    </div>
  );
}

// Simple text version for inline use
export function LogoText({ 
  className = '', 
  size = 'md',
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl font-bold',
    md: 'text-3xl font-bold',
    lg: 'text-4xl font-bold',
    xl: 'text-5xl font-bold'
  };

  const variantClasses = {
    default: 'text-primary-600',
    gradient: 'text-primary-600',
    simple: 'text-primary-600',
    'text-only': 'text-primary-600'
  };

  return (
    <span className={`mulish-bold ${sizeClasses[size]} ${variantClasses[variant]} tracking-tight ${className}`}>
      kendraa
    </span>
  );
} 