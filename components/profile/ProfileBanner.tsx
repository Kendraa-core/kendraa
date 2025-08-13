'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';

interface ProfileBannerProps {
  bannerUrl?: string;
  quote?: string;
  isOwnProfile?: boolean;
  onBannerChange?: (url: string) => void;
  onQuoteChange?: (quote: string) => void;
}

const INSPIRATIONAL_QUOTES = [
  'Do what you love, Love what you do',
  'Healing is not only about medicine, but about compassion',
  'Excellence in healthcare, powered by innovation',
  'Dedicated to improving lives through medical expertise',
  'Committed to advancing healthcare for all',
  'Where science meets compassion',
  'Innovation in healthcare, dedication to patients',
  'Transforming healthcare through knowledge and care'
];

export default function ProfileBanner({ 
  bannerUrl, 
  quote = 'Do what you love, Love what you do',
  isOwnProfile = false,
  onBannerChange,
  onQuoteChange 
}: ProfileBannerProps) {
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuote, setTempQuote] = useState(quote);
  const [showQuoteSuggestions, setShowQuoteSuggestions] = useState(false);

  const handleQuoteSubmit = () => {
    onQuoteChange?.(tempQuote);
    setIsEditingQuote(false);
  };

  const handleQuoteSuggestion = (suggestedQuote: string) => {
    setTempQuote(suggestedQuote);
    setShowQuoteSuggestions(false);
    onQuoteChange?.(suggestedQuote);
    setIsEditingQuote(false);
  };

  return (
    <div className="relative h-48 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-t-xl overflow-hidden group">
      {/* Background Image */}
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt="Profile banner"
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="medical-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="white" opacity="0.3" />
                  <path d="M8 10h4M10 8v4" stroke="white" strokeWidth="0.5" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#medical-pattern)" />
            </svg>
          </div>
        </div>
      )}

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Quote Section */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {isEditingQuote ? (
          <div className="relative w-full max-w-md">
            <textarea
              value={tempQuote}
              onChange={(e) => setTempQuote(e.target.value)}
              className="w-full p-3 text-center bg-white bg-opacity-90 text-gray-900 rounded-lg resize-none"
              rows={2}
              placeholder="Add your inspirational quote..."
              onBlur={handleQuoteSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuoteSubmit();
                }
                if (e.key === 'Escape') {
                  setIsEditingQuote(false);
                  setTempQuote(quote);
                }
              }}
              autoFocus
            />
            
            {/* Quote Suggestions */}
            <button
              onClick={() => setShowQuoteSuggestions(!showQuoteSuggestions)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
            >
              💡 Suggestions
            </button>
            
            {showQuoteSuggestions && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-40 overflow-y-auto">
                {INSPIRATIONAL_QUOTES.map((suggestedQuote, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuoteSuggestion(suggestedQuote)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    {suggestedQuote}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div 
            className={`text-center ${isOwnProfile ? 'cursor-pointer group' : ''}`}
            onClick={() => isOwnProfile && setIsEditingQuote(true)}
          >
            <h2 
              className="text-2xl md:text-3xl font-light text-white italic tracking-wide leading-relaxed"
              style={{ 
                fontFamily: 'Georgia, serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
&quot;{quote}&quot;
            </h2>
            {isOwnProfile && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                <PencilIcon className="w-4 h-4 text-white mx-auto" />
                <span className="text-xs text-white">Click to edit quote</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banner Edit Button */}
      {isOwnProfile && (
        <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70">
          <CameraIcon className="w-5 h-5" />
        </button>
      )}

      {/* Medical Symbol Decoration */}
      <div className="absolute bottom-4 right-4 opacity-20">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <path d="M9 11h2V9h2v2h2v2h-2v2h-2v-2H9v-2z" fill="white" opacity="0.6"/>
        </svg>
      </div>
    </div>
  );
}
