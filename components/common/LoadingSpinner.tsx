'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  className?: string;
  text?: string;
  variant?: 'spinner' | 'logo' | 'fullscreen';
  showLogo?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text,
  variant = 'spinner',
  showLogo = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    fullscreen: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    fullscreen: 'text-xl',
  };

  // Fullscreen loading with modern design
  if (variant === 'fullscreen' || size === 'fullscreen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#007fff]/5 via-white to-[#007fff]/10 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-[#007fff]/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#007fff]/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          {/* Kendraa Logo with Modern Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-[#007fff]/20 rounded-2xl blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Image
                src="/Kendraa Logo (1).png"
                alt="Kendraa - Healthcare Professional Networking"
                width={320}
                height={76}
                className="h-20 w-auto mx-auto relative z-10"
                priority
              />
            </div>
          </motion.div>
          
          {/* Modern Fluid Loading Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                className="w-20 h-20 border-2 border-[#007fff]/20 rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle Ring */}
              <motion.div
                className="absolute top-1 left-1 w-18 h-18 border-2 border-[#007fff]/40 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner Core */}
              <motion.div
                className="absolute top-3 left-3 w-14 h-14 bg-gradient-to-r from-[#007fff] to-[#007fff]/80 rounded-full"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Floating Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[#007fff] rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: `${20 + i * 8}px 0px`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Loading Text with Typing Animation */}
          {text && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="space-y-2"
            >
              <motion.p
                className="text-[#007fff] text-xl font-semibold"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {text}
              </motion.p>
              
              {/* Progress Dots */}
              <div className="flex justify-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-[#007fff] rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Logo variant with modern spinner
  if (variant === 'logo' || showLogo) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-[#007fff]/10 rounded-lg blur-sm"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <Image
              src="/Kendraa Logo (1).png"
              alt="Kendraa"
              width={120}
              height={29}
              className="h-8 w-auto relative z-10"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative"
        >
          <motion.div
            className={`${sizeClasses[size]} border-2 border-[#007fff]/20 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className={`absolute top-0.5 left-0.5 ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : size === 'xl' ? 'w-15 h-15' : 'w-19 h-19'} bg-gradient-to-r from-[#007fff] to-[#007fff]/80 rounded-full`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className={`mt-4 ${textSizeClasses[size]} text-[#007fff] font-medium`}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Default modern spinner variant
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <motion.div
          className={`${sizeClasses[size]} border-2 border-[#007fff]/20 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`absolute top-0.5 left-0.5 ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : size === 'xl' ? 'w-14 h-14' : 'w-18 h-18'} bg-gradient-to-r from-[#007fff] to-[#007fff]/80 rounded-full`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`mt-3 ${textSizeClasses[size]} text-[#007fff] font-medium`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
} 