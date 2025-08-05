/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for dynamic content
  staticPageGenerationTimeout: 120,
  
  // Optimize images
  images: {
    domains: ['localhost', '127.0.0.1'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Disable optimizePackageImports to prevent cache issues
    // optimizePackageImports: ['@heroicons/react'],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    // Add cache busting
    config.output.filename = dev 
      ? 'static/js/[name].js'
      : 'static/js/[name].[contenthash].js';
    
    config.output.chunkFilename = dev
      ? 'static/js/[name].chunk.js'
      : 'static/js/[name].[contenthash].chunk.js';

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Disable automatic static optimization for dynamic pages
  trailingSlash: false,
  
  // Enable React strict mode for better development
  reactStrictMode: true,
};

module.exports = nextConfig; 