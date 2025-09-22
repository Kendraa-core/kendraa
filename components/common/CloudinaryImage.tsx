"use client";

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number | 'auto';
  crop?: 'fill' | 'fit' | 'limit' | 'mfit' | 'mpad' | 'pad' | 'scale' | 'thumb';
  gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west' | 'face' | 'faces';
  radius?: number | 'max';
  placeholder?: 'blur';
  blurDataURL?: string;
  onClick?: () => void;
}

export default function CloudinaryImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  quality = 'auto',
  crop = 'fill',
  gravity = 'auto',
  radius,
  placeholder = 'blur',
  blurDataURL,
  onClick
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if the src is a Cloudinary URL
  const isCloudinaryUrl = src.includes('cloudinary.com') || src.includes('res.cloudinary.com');

  if (!isCloudinaryUrl || hasError) {
    // Fallback to regular img tag for non-Cloudinary URLs
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onClick={onClick}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={{ 
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        crop={crop}
        gravity={gravity}
        radius={radius}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onClick={onClick}
        style={{ 
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}

// Specialized components for common use cases
export function AvatarImage({ src, alt, size = 40, className = '' }: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      crop="fill"
      gravity="face"
      radius="max"
    />
  );
}

export function PostImage({ src, alt, className = '' }: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={600}
      height={400}
      className={`rounded-lg ${className}`}
      crop="fill"
      gravity="auto"
    />
  );
}

export function BannerImage({ src, alt, className = '' }: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={1200}
      height={300}
      className={`rounded-lg ${className}`}
      crop="fill"
      gravity="auto"
    />
  );
}
