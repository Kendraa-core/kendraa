import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ClientOnly from '@/components/common/ClientOnly';

const inter = Inter({ subsets: ['latin'] });
const mulish = {
  className: 'font-mulish',
  style: {
    fontFamily: 'Mulish, sans-serif',
  },
};

// Glacial Indifference font
const glacialIndifference = {
  className: 'font-glacial',
  style: {
    fontFamily: 'Glacial Indifference, sans-serif',
  },
};

export const metadata: Metadata = {
  title: 'kendraa - Healthcare Professional Network',
  description: 'Connect, collaborate, and grow with healthcare professionals worldwide',
  keywords: 'healthcare, medical, professionals, network, collaboration',
  authors: [{ name: 'kendraa Team' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#007FFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#007FFF" />
        <meta name="msapplication-TileColor" content="#007FFF" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/glacial-indifference" rel="stylesheet" />
      </head>
      <body className={`${mulish.className} h-full bg-white`} suppressHydrationWarning={true}>
        <ClientOnly>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#007FFF',
                    color: '#fff',
                    maxWidth: '400px',
                  },
                  success: {
                    style: {
                      background: '#007FFF',
                    },
                  },
                  error: {
                    style: {
                      background: '#007FFF',
                    },
                  },
                }}
              />
            </NotificationProvider>
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
} 