'use client';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Loading Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg animate-pulse" />
              <div className="w-24 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
            
            {/* Nav Skeleton */}
            <div className="hidden md:flex items-center space-x-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
            
            {/* Profile Skeleton */}
            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" />
                <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
              
              <div className="mt-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
                <div className="flex-1 h-12 bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Posts Skeleton */}
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Post Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="w-24 h-3 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
                
                {/* Post Content */}
                <div className="space-y-3 mb-4">
                  <div className="w-full h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse" />
                </div>
                
                {/* Post Image */}
                {i === 2 && (
                  <div className="w-full h-48 bg-slate-200 rounded-lg animate-pulse mb-4" />
                )}
                
                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-6">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
                        <div className="w-8 h-4 bg-slate-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="w-24 h-5 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="w-32 h-5 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-slate-200 rounded animate-pulse mb-1" />
                      <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50 animate-progress" />
    </div>
  );
} 