'use client';

import { put } from '@vercel/blob';

export interface VercelBlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: Date;
}

export async function uploadToVercelBlob(
  file: File,
  pathname?: string,
  options?: {
    access?: 'public';
    addRandomSuffix?: boolean;
    allowOverwrite?: boolean;
    cacheControlMaxAge?: number;
  }
): Promise<{ url: string; error: any | null }> {
  try {
    console.log('Uploading to Vercel Blob:', { fileName: file.name, pathname });
    
    // Generate pathname if not provided
    const finalPathname = pathname || `uploads/${Date.now()}-${file.name}`;
    
    const blob = await put(finalPathname, file, {
      access: 'public',
      addRandomSuffix: true, // Add random suffix to prevent conflicts
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      ...options
    });

    console.log('Vercel Blob upload successful:', blob.url);
    
    return {
      url: blob.url,
      error: null
    };
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    return {
      url: '',
      error: error
    };
  }
}

// Specialized upload functions for different use cases
export async function uploadPostImage(file: File): Promise<{ url: string; error: any | null }> {
  return uploadToVercelBlob(file, `posts/${Date.now()}-${file.name}`, {
    access: 'public',
    addRandomSuffix: true,
    cacheControlMaxAge: 2592000 // 30 days
  });
}

export async function uploadProfileImage(file: File, userId: string): Promise<{ url: string; error: any | null }> {
  return uploadToVercelBlob(file, `profiles/${userId}/avatar-${Date.now()}.${file.name.split('.').pop()}`, {
    access: 'public',
    addRandomSuffix: true,
    cacheControlMaxAge: 2592000 // 30 days
  });
}

export async function uploadInstitutionLogo(file: File, institutionId: string): Promise<{ url: string; error: any | null }> {
  return uploadToVercelBlob(file, `institutions/${institutionId}/logo-${Date.now()}.${file.name.split('.').pop()}`, {
    access: 'public',
    addRandomSuffix: true,
    cacheControlMaxAge: 2592000 // 30 days
  });
}

export async function uploadInstitutionBanner(file: File, institutionId: string): Promise<{ url: string; error: any | null }> {
  return uploadToVercelBlob(file, `institutions/${institutionId}/banner-${Date.now()}.${file.name.split('.').pop()}`, {
    access: 'public',
    addRandomSuffix: true,
    cacheControlMaxAge: 2592000 // 30 days
  });
}

export async function uploadEventImage(file: File, eventId: string): Promise<{ url: string; error: any | null }> {
  return uploadToVercelBlob(file, `events/${eventId}/image-${Date.now()}.${file.name.split('.').pop()}`, {
    access: 'public',
    addRandomSuffix: true,
    cacheControlMaxAge: 2592000 // 30 days
  });
}

export async function uploadJobImage(file: File, jobId: string): Promise<{ url: string; error: any | null }> {
  return uploadToVercelBlob(file, `jobs/${jobId}/image-${Date.now()}.${file.name.split('.').pop()}`, {
    access: 'public',
    addRandomSuffix: true,
    cacheControlMaxAge: 2592000 // 30 days
  });
}
