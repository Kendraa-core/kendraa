'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Page Not Found
              </h2>
              
              <p className="text-gray-600">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/feed'}
                  className="flex items-center justify-center"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 