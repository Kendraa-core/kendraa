import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSupabase } from "./queries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to get Supabase storage URL
export function getSupabaseStorageUrl(bucket: string, path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// This helper is now correct and will work with the new RLS policies
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; error: any | null }> {
  try {
    console.log('Uploading to bucket:', bucket, 'with path:', path);
    const supabase = getSupabase();
    
    if (!supabase) {
      console.error('Supabase client not available');
      return { url: '', error: new Error('Supabase client not available') };
    }
    
    // Try to upload directly - if bucket doesn't exist, we'll get a clear error
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { url: '', error: uploadError };
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    
    if (!urlData.publicUrl) {
      const urlError = new Error('Upload successful, but could not get public URL.');
      console.error(urlError.message);
      return { url: '', error: urlError };
    }

    console.log('Upload successful, URL:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
    
  } catch (error) {
    console.error('Unexpected error in uploadToSupabaseStorage:', error);
    return { url: '', error: error instanceof Error ? error : new Error('An unexpected error occurred during upload.') };
  }
}

// Utility function to delete file from Supabase storage
export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return { error: error?.message || null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

// Utility function to validate file size and type
export function validateFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' };
  }
  return { valid: true };
}

// --- THIS IS THE CORRECTED HELPER FUNCTION ---
/**
 * Generates a unique file path for Supabase storage.
 * The path is structured as: `userId/userId_timestamp.extension`
 * This structure is required for the Storage RLS policies to work correctly.
 */
export function generateFilePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  // The 'folder' or bucket name should not be part of the path itself.
  // It is handled by the `.from(bucket)` call in the upload function.
  return `${userId}/${userId}_${timestamp}.${extension}`;
}


// --- All other utility functions below are unchanged ---

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Utility function to throttle function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Utility function to format date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Utility function to format date relative to now
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

// Utility function to truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Utility function to generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Utility function to validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to validate password strength
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility function to format number with K, M suffixes
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

