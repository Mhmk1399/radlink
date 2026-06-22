// Utility functions for Liara Object Storage file URL management

export interface LiaraFileInfo {
  key: string;
  url: string;
  originalName?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

/**
 * Generate Liara Object Storage URL from file key (no expiration - permanent URLs)
 * @param key - The file key
 * @returns Liara Object Storage URL
 */
export function getLiaraUrl(key: string): string {
  // Use the public environment variable for client-side access
  const bucketName = process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME || 'arziplus';
  
  if (!process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME) {
    console.warn('NEXT_PUBLIC_LIARA_BUCKET_NAME not configured, using fallback');
  }
  
  return `https://${bucketName}.storage.c2.liara.space/${key}`;
}

// Alias for backward compatibility
export function getCloudFrontUrl(key: string): string {
  return getLiaraUrl(key);
}

/**
 * Generate Liara Object Storage URLs from multiple file keys
 * @param keys - Array of file keys
 * @returns Array of Liara Object Storage URLs
 */
export function getLiaraUrls(keys: string[]): string[] {
  return keys.map(key => getLiaraUrl(key));
}

// Alias for backward compatibility
export function getCloudFrontUrls(keys: string[]): string[] {
  return getLiaraUrls(keys);
}

/**
 * Extract file key from Liara Object Storage URL
 * @param url - Liara Object Storage URL
 * @returns File key
 */
export function extractKeyFromUrl(url: string): string {
  const bucketName = process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME;
  
  if (!bucketName || !url.includes('.storage.c2.liara.space')) {
    return '';
  }
  
  return url.split(`${bucketName}.storage.c2.liara.space/`)[1] || '';
}

/**
 * Upload a file to Liara Object Storage and get back the file info
 * @param file - File object to upload
 * @returns Promise with upload response
 */
export async function uploadFile(file: File): Promise<LiaraFileInfo | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    console.log('Upload failed:', result.error);
    return null;
  } catch (error) {
    console.log('Upload error:', error);
    return null;
  }
}

/**
 * Format file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type icon emoji
 * @param mimeType - File MIME type
 * @returns Emoji string
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('text')) return '📄';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  return '📁';
}