'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardContent className="p-12 text-center">
            {/* 404 Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl font-bold text-linkedin-primary opacity-20"
                >
                  404
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-linkedin-light rounded-full flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-8 h-8 text-linkedin-primary" />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Page not found
                </h1>
                <p className="text-gray-600">
                  Sorry, we couldn&apos;t find the page you&apos;re looking for. 
                  It might have been moved, deleted, or you entered the wrong URL.
                </p>
              </div>

              {/* Search Suggestion */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">What you can do:</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-linkedin-primary rounded-full mr-3" />
                    Check the URL for any typos
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-linkedin-primary rounded-full mr-3" />
                    Go back to the previous page
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-linkedin-primary rounded-full mr-3" />
                    Visit our home page
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-linkedin-primary rounded-full mr-3" />
                    Search for what you need
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Go back
                </Button>
                
                <Link href="/feed">
                  <Button className="flex items-center justify-center w-full sm:w-auto">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Go to Feed
                  </Button>
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">Or explore these popular areas:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/network">
              <Button variant="ghost" size="sm">My Network</Button>
            </Link>
            <Link href="/profile/setup">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="sm">Notifications</Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 