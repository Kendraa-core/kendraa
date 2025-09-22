'use client';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'kendraa'
): Promise<{ url: string; error: any | null }> {
  try {
    console.log('Uploading to Cloudinary:', { fileName: file.name, folder });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'kendraa_preset'); // You'll need to create this preset in Cloudinary
    formData.append('folder', folder);
    
    // Upload to Cloudinary using unsigned upload
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dgvubqfnf/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.public_id);
    
    return {
      url: result.secure_url,
      error: null
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      url: '',
      error: error
    };
  }
}

// Alternative method using signed upload (more secure)
export async function uploadToCloudinarySigned(
  file: File,
  folder: string = 'kendraa'
): Promise<{ url: string; error: any | null }> {
  try {
    console.log('Uploading to Cloudinary (signed):', { fileName: file.name, folder });
    
    // First, get the signature from your API
    const signatureResponse = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folder,
        timestamp: Math.round(new Date().getTime() / 1000)
      })
    });

    if (!signatureResponse.ok) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, timestamp } = await signatureResponse.json();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('api_key', '128337835559652');
    formData.append('folder', folder);
    
    // Upload to Cloudinary using signed upload
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dgvubqfnf/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.public_id);
    
    return {
      url: result.secure_url,
      error: null
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      url: '',
      error: error
    };
  }
}
