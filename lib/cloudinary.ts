import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true
  });
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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
    
    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto', // Automatically detect image, video, etc.
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

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

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

// Helper function to extract public_id from Cloudinary URL
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}
