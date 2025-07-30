'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900">
                    Something went wrong!
                  </h2>
                  
                  <p className="text-gray-600">
                    We&apos;re experiencing some technical difficulties. 
                    Our team has been notified and is working on a fix.
                  </p>

                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                        {error.message}
                      </pre>
                      {error.digest && (
                        <p className="text-xs text-gray-500 mt-2">
                          Error ID: {error.digest}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Button onClick={reset} className="flex items-center justify-center">
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Try again
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/feed'}
                      className="flex items-center justify-center"
                    >
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Go home
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </body>
    </html>
  );
} 