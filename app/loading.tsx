'use client';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-ping opacity-20"></div>
        </div>
        
        <p className="text-gray-600 mt-4 text-sm font-medium">Loading Kendraa...</p>
        
        {/* Progress dots */}
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
} 