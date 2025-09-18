'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

// Responsive, accessible, and robust loading component
// - respects prefers-reduced-motion
// - uses SVG for crisp scalable rings
// - semantic markup (role=status, aria-live)
// - sensible fallbacks and friendly props

export default function Loading({
  text = 'Loading your dashboard...',
  logoSrc = '/Kendraa Logo (1).png',
  logoAlt = 'Kendraa - Healthcare Professional Networking',
  size = 80, // base spinner size in pixels (can be number or numeric string)
}: {
  text?: string;
  logoSrc?: string;
  logoAlt?: string;
  size?: number | string;
}) {
  const reduce = useReducedMotion();

  // Defensive size handling to prevent NaN style values
  const DEFAULT_SIZE = 80;
  const rawSize = Number(size);
  const safeSize = Number.isFinite(rawSize) ? rawSize : DEFAULT_SIZE;
  const spinnerSize = Math.max(48, Math.min(160, safeSize)); // clamp between 48 and 160

  const bgVariants = {
    animate: reduce
      ? {}
      : {
          scale: [1, 1.12, 1],
          opacity: [0.25, 0.6, 0.25],
          transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
        },
  };

  const ringRotate = reduce
    ? {}
    : { rotate: [0, 360], transition: { duration: 3, repeat: Infinity, ease: 'linear' as const } };

  const dotPulse = (i: number) =>
    reduce
      ? {}
      : {
          scale: [1, 1.35, 1],
          opacity: [0.4, 1, 0.4],
          transition: { duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' as const },
        };

  // Pixel values for core size
  const corePx = Math.round(spinnerSize * 0.35);
  const innerSvg = Math.round(spinnerSize * 0.9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007fff]/5 via-white to-[#007fff]/10 flex items-center justify-center p-6">
      {/* Decorative animated backdrop circles (purely visual) */}
      <motion.div
        aria-hidden
        initial={false}
        animate="animate"
        variants={bgVariants}
        className="pointer-events-none absolute -z-10 w-[36rem] h-[36rem] max-w-none rounded-full bg-[#007fff]/10 blur-[60px] md:scale-100"
      />

      <div className="relative z-10 text-center w-full max-w-xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' as const }}
          className="mb-8 flex items-center justify-center"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-[#007fff]/20 blur-xl" />
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={320}
              height={76}
              className="h-16 w-auto mx-auto relative z-10 object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Spinner + particles */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
            style={{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }} // container sizing
          >
            {/* SVG rings give crisp, responsive circles */}
            <motion.svg
              width={spinnerSize}
              height={spinnerSize}
              viewBox="0 0 100 100"
              className="block"
              animate={ringRotate}
            >
              <circle cx="50" cy="50" r="46" strokeWidth="2.5" stroke="#007fff33" fill="none" />
            </motion.svg>

            <motion.svg
              width={innerSvg}
              height={innerSvg}
              viewBox="0 0 100 100"
              className="absolute inset-0 m-auto"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
              animate={reduce ? {} : { rotate: -360, transition: { duration: 2.2, repeat: Infinity, ease: 'linear' as const } }}
            >
              <circle cx="50" cy="50" r="38" strokeWidth="2.5" stroke="#007fff55" fill="none" />
            </motion.svg>

            {/* Core */}
            <motion.div
              className="absolute m-auto inset-0 flex items-center justify-center"
              style={{ width: `${corePx}px`, height: `${corePx}px` }}
              animate={reduce ? {} : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85], transition: { duration: 1.4, repeat: Infinity } }}
            >
              <div
                className="rounded-full bg-gradient-to-r from-[#007fff] to-[#007fff]/80"
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>

            {/* Floating particles around the spinner (positioned with transforms) */}
            {[...Array(6)].map((_, i) => {
              // compute relative position inside the spinner container (in px)
              const angle = (i / 6) * Math.PI * 2;
              // radius in px - keep within container bounds
              const radiusPx = Math.max(12, Math.min(spinnerSize / 2 - 6, spinnerSize / 3));
              const cx = spinnerSize / 2 + Math.cos(angle) * radiusPx;
              const cy = spinnerSize / 2 + Math.sin(angle) * radiusPx;

              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-[#007fff]" // particles visible
                  style={{
                    width: 6,
                    height: 6,
                    left: `${Math.round(cx)}px`,
                    top: `${Math.round(cy)}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={dotPulse(i)}
                />
              );
            })}
          </motion.div>

          {/* Text + progress dots */}
          <div className="flex flex-col items-center text-center">
            <motion.p
              className="text-[#007fff] text-lg font-semibold"
              initial={{ opacity: 0.7 }}
              animate={reduce ? {} : { opacity: [0.7, 1, 0.7], transition: { duration: 2, repeat: Infinity } }}
            >
              {text}
            </motion.p>

            <div className="mt-2 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-2.5 h-2.5 rounded-full bg-[#007fff]"
                  animate={dotPulse(i + 1)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Small help text for accessibility (screen readers will read role/status above) */}
        <span className="sr-only">Application is loading — please wait.</span>
      </div>
    </div>
  );
}
