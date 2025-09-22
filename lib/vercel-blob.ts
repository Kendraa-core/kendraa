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
    allowOverwrite?: boolean;
  }
): Promise<{ url: string; error: any | null }> {
  try {
    console.log('Uploading to Vercel Blob:', { fileName: file.name, pathname });
    
    // Generate pathname with random suffix manually to avoid CORS issues
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const finalPathname = pathname || `uploads/${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`;
    
    const blob = await put(finalPathname, file, {
      access: 'public',
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
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return uploadToVercelBlob(file, `posts/${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`, {
    access: 'public'
  });
}

export async function uploadProfileImage(file: File, userId: string): Promise<{ url: string; error: any | null }> {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return uploadToVercelBlob(file, `profiles/${userId}/avatar-${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`, {
    access: 'public'
  });
}

export async function uploadInstitutionLogo(file: File, institutionId: string): Promise<{ url: string; error: any | null }> {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return uploadToVercelBlob(file, `institutions/${institutionId}/logo-${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`, {
    access: 'public'
  });
}

export async function uploadInstitutionBanner(file: File, institutionId: string): Promise<{ url: string; error: any | null }> {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return uploadToVercelBlob(file, `institutions/${institutionId}/banner-${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`, {
    access: 'public'
  });
}

export async function uploadEventImage(file: File, eventId: string): Promise<{ url: string; error: any | null }> {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return uploadToVercelBlob(file, `events/${eventId}/image-${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`, {
    access: 'public'
  });
}

export async function uploadJobImage(file: File, jobId: string): Promise<{ url: string; error: any | null }> {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return uploadToVercelBlob(file, `jobs/${jobId}/image-${Date.now()}-${baseName}-${randomSuffix}.${fileExt}`, {
    access: 'public'
  });
}
