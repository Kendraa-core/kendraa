import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ClientOnly from '@/components/common/ClientOnly';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kendraa - Healthcare Professional Network',
  description: 'Connect, collaborate, and grow with healthcare professionals worldwide',
  keywords: 'healthcare, medical, professionals, network, collaboration',
  authors: [{ name: 'Kendraa Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=true',
  themeColor: '#007FFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#007FFF" />
        <meta name="msapplication-TileColor" content="#007FFF" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} h-full bg-white`}>
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