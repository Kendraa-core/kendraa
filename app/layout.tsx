import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import './globals.css';
import PerformanceOptimizer from '@/components/common/PerformanceOptimizer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Kendraa - Royal Network for Healthcare Professionals',
    template: '%s | Kendraa',
  },
  description: 'Join the world\'s premier professional network designed specifically for healthcare professionals. Connect with peers, discover opportunities, and advance your medical career with Kendraa.',
  keywords: ['healthcare', 'medical professionals', 'networking', 'doctors', 'nurses', 'medical careers', 'healthcare jobs', 'medical network'],
  authors: [{ name: 'Kendraa Team' }],
  creator: 'Kendraa',
  publisher: 'Kendraa',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Kendraa',
    title: 'Kendraa - Royal Network for Healthcare Professionals',
    description: 'Connect with healthcare professionals worldwide and advance your medical career with the premier healthcare networking platform.',
    images: [
      {
        url: '/Kendraa Logo.png',
        width: 1200,
        height: 630,
        alt: 'Kendraa - Royal Network for Healthcare Professionals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kendraa - Royal Network for Healthcare Professionals',
    description: 'Connect with healthcare professionals worldwide and advance your medical career with the premier healthcare networking platform.',
    images: ['/Kendraa Logo.png'],
    creator: '@kendraa_health',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/Kendraa Logo.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Unregister any existing service workers
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
                
                // Clear all caches
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) {
                      caches.delete(name);
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased font-sans" suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                  },
                  success: {
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
              <PerformanceOptimizer />
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 