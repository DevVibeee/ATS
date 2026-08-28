import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with user credentials or environment fallback
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvuy2z4ka';
const apiKey = process.env.CLOUDINARY_API_KEY || '662738125879111';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'DVw7R2fo0IOgCey3z2VupmQyu-E';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

/**
 * Uploads a base64 string or file URL to Cloudinary
 * @param fileData Base64 string or image URL
 * @param folder Cloudinary folder name
 * @param resourceType 'image' | 'raw' | 'auto'
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'auraats_uploads',
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
) {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: resourceType,
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(error.message || 'Cloudinary upload failed');
  }
}
