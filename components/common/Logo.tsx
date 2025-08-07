'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'simple';
}

export default function Logo({ 
  className = '', 
  size = 'md', 
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold'
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent',
    gradient: 'bg-gradient-to-r from-primary-500 via-accent-500 to-primary-700 bg-clip-text text-transparent',
    simple: 'text-primary-600'
  };

  return (
    <div className={`font-display ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      <span className="tracking-tight">Kendraa</span>
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
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-semibold',
    xl: 'text-2xl font-semibold'
  };

  const variantClasses = {
    default: 'text-primary-600',
    gradient: 'bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent',
    simple: 'text-primary-600'
  };

  return (
    <span className={`font-display ${sizeClasses[size]} ${variantClasses[variant]} tracking-tight ${className}`}>
      Kendraa
    </span>
  );
} 