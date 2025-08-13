'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  href?: string;
  className?: string;
  showText?: boolean;
}

export default function BackButton({ 
  href, 
  className = '',
  showText = false 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      title="Go back"
    >
      <ArrowLeftIcon className="w-5 h-5" />
      {showText && <span className="text-sm font-medium">Back</span>}
    </button>
  );
} 