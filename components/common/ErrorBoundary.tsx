'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Report to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        
        
        
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <div
              
              
              
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>

            <div
              
              
              
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Oops! Something went wrong
              </h2>
              
                                <p className="text-gray-600">
                    We encountered an unexpected error. Our team has been notified and we&apos;re working on a fix.
                  </p>

              {isDevelopment && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Error Details:</p>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                    {error.message}
                    {error.stack && '\n\n' + error.stack}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button onClick={retry} className="flex items-center justify-center">
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
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

// Specialized error boundaries
export function NetworkErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={NetworkErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

function NetworkErrorFallback({ retry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
        <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Connection Error</h3>
        <p className="text-gray-600 max-w-sm">
          Unable to connect to our servers. Please check your internet connection and try again.
        </p>
      </div>
      
      <Button onClick={retry} variant="outline">
        <ArrowPathIcon className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}

export default ErrorBoundary; 