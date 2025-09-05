// Error handling utilities for consistent error management

export interface AppError {
  type: 'authentication' | 'permission' | 'network' | 'validation' | 'database' | 'unknown';
  message: string;
  code?: string;
  details?: any;
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends Error {
  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'PermissionError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Parse Supabase errors and convert to AppError
export function handleSupabaseError(error: any): AppError {
        // Supabase error logged

  if (!error) {
    return {
      type: 'unknown',
      message: 'An unknown error occurred'
    };
  }

  // Handle specific Supabase error codes
  if (error.code) {
    switch (error.code) {
      case 'PGRST301':
        return {
          type: 'authentication',
          message: 'Authentication required. Please log in again.',
          code: error.code
        };
      case 'PGRST302':
        return {
          type: 'permission',
          message: 'Permission denied. You don\'t have access to this resource.',
          code: error.code
        };
      case 'PGRST114':
        return {
          type: 'database',
          message: 'Database table not found. Please contact support.',
          code: error.code
        };
      case '23505':
        return {
          type: 'validation',
          message: 'Duplicate entry detected.',
          code: error.code
        };
      case '23503':
        return {
          type: 'validation',
          message: 'Referenced record not found.',
          code: error.code
        };
      case '23514':
        return {
          type: 'validation',
          message: 'Invalid data provided.',
          code: error.code
        };
      default:
        return {
          type: 'database',
          message: error.message || 'Database operation failed',
          code: error.code
        };
    }
  }

  // Handle error messages
  const message = error.message || error.toString();
  
  if (message.includes('JWT') || message.includes('401') || message.includes('authentication')) {
    return {
      type: 'authentication',
      message: 'Authentication error. Please log in again.',
      details: error
    };
  }

  if (message.includes('403') || message.includes('permission') || message.includes('forbidden')) {
    return {
      type: 'permission',
      message: 'Permission denied. You don\'t have access to this resource.',
      details: error
    };
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.',
      details: error
    };
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return {
      type: 'validation',
      message: 'Invalid data provided. Please check your input.',
      details: error
    };
  }

  return {
    type: 'unknown',
    message: message || 'An unexpected error occurred',
    details: error
  };
}

// Handle authentication errors
export function handleAuthError(error: any): AppError {
        // Auth error logged

  if (!error) {
    return {
      type: 'authentication',
      message: 'Authentication failed'
    };
  }

  const message = error.message || error.toString();

  if (message.includes('Invalid login credentials')) {
    return {
      type: 'authentication',
      message: 'Invalid email or password. Please try again.'
    };
  }

  if (message.includes('Email not confirmed')) {
    return {
      type: 'authentication',
      message: 'Please check your email and confirm your account before signing in.'
    };
  }

  if (message.includes('User already registered')) {
    return {
      type: 'validation',
      message: 'An account with this email already exists. Please sign in instead.'
    };
  }

  if (message.includes('Too many requests')) {
    return {
      type: 'validation',
      message: 'Too many attempts. Please wait a moment before trying again.'
    };
  }

  if (message.includes('User not found')) {
    return {
      type: 'authentication',
      message: 'User not found. Please check your credentials.'
    };
  }

  return {
    type: 'authentication',
    message: message || 'Authentication failed. Please try again.'
  };
}

// Log errors consistently
export function logError(context: string, error: any, additionalData?: any) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error?.message || error?.toString() || error,
    stack: error?.stack,
    code: error?.code,
    additionalData
  };

      // Error logged with timestamp and context
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}

// Get user-friendly error message
export function getErrorMessage(error: AppError | any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.type && error?.message) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

// Get error suggestion for user
export function getErrorSuggestion(error: AppError): string {
  switch (error.type) {
    case 'authentication':
      return 'Please try logging out and logging back in.';
    case 'permission':
      return 'Please contact support if you believe this is an error.';
    case 'network':
      return 'Please check your internet connection and try again.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'database':
      return 'Please try again in a moment. If the problem persists, contact support.';
    default:
      return 'Please try again. If the problem persists, contact support.';
  }
}

// Check if error is retryable
export function isRetryableError(error: AppError): boolean {
  return error.type === 'network' || error.type === 'database';
}

// Validate required fields
export function validateRequired(data: any, requiredFields: string[]): ValidationError | null {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      return new ValidationError(`${field} is required`, field);
    }
  }
  return null;
}

// Validate string length
export function validateStringLength(value: string, field: string, min: number, max: number): ValidationError | null {
  if (value.length < min) {
    return new ValidationError(`${field} must be at least ${min} characters long`, field);
  }
  if (value.length > max) {
    return new ValidationError(`${field} must be no more than ${max} characters long`, field);
  }
  return null;
}

// Validate email format
export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new ValidationError('Please enter a valid email address', 'email');
  }
  return null;
}

// Safe JSON parsing with error handling
export function safeJsonParse(jsonString: string, fallback: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logError('safeJsonParse', error, { jsonString });
    return fallback;
  }
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    logError(context, error);
    return fallback || null;
  }
} 