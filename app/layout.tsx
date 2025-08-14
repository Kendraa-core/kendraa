import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ClientOnly from '@/components/common/ClientOnly';
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
        url: '/mainlogo.svg',
        width: 300,
        height: 80,
        alt: 'Kendraa - Royal Network for Healthcare Professionals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kendraa - Royal Network for Healthcare Professionals',
    description: 'Connect with healthcare professionals worldwide and advance your medical career with the premier healthcare networking platform.',
    images: ['/mainlogo.svg'],
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
      { url: '/mainicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/mainicon.svg',
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
              // Completely disable service workers
              if ('serviceWorker' in navigator) {
                // Override the register method to prevent new registrations
                const originalRegister = navigator.serviceWorker.register;
                navigator.serviceWorker.register = function() {
                  console.log('Service worker registration blocked');
                  return Promise.reject(new Error('Service workers are disabled'));
                };
                
                // Unregister all existing service workers
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('Service worker unregistered');
                  }
                });
                
                // Clear all caches
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (let name of names) {
                      caches.delete(name);
                      console.log('Cache deleted:', name);
                    }
                  });
                }
                
                // Prevent new service workers from registering
                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'SKIP_WAITING') {
                    event.preventDefault();
                  }
                });
              }
              
              // Clear any existing service worker
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(function(registration) {
                  registration.unregister();
                });
              }
              
              // Disable any existing service worker
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({type: 'TERMINATE'});
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
              <ClientOnly>
                <PerformanceOptimizer />
              </ClientOnly>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 