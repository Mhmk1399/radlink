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
  const configuredBase = (
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_LIARA_PUBLIC_URL ||
    ""
  ).replace(/\/+$/, '');
  const bucketName = process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME || 'arziplus';
  
  if (!process.env.NEXT_PUBLIC_LIARA_BUCKET_NAME) {
    console.warn('NEXT_PUBLIC_LIARA_BUCKET_NAME not configured, using fallback');
  }

  const baseUrl =
    configuredBase || `https://${bucketName}.storage.c2.liara.site`;
  const encodedKey = key
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  return `${baseUrl}/${encodedKey}`;
}

export function normalizeLiaraUrl(url: string): string {
  if (!url) return "";

  const configuredBase = (
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_LIARA_PUBLIC_URL ||
    ""
  ).replace(/\/+$/, "");

  if (!configuredBase) {
    return url.replace(
      ".storage.c2.liara.space/",
      ".storage.c2.liara.site/",
    );
  }

  try {
    const parsedUrl = new URL(url);
    const isLiaraStorageUrl =
      parsedUrl.hostname.includes(".storage.") &&
      parsedUrl.hostname.includes(".liara.");

    return isLiaraStorageUrl
      ? `${configuredBase}${parsedUrl.pathname}${parsedUrl.search}`
      : url;
  } catch {
    return url;
  }
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
  try {
    const parsedUrl = new URL(normalizeLiaraUrl(url));
    if (!parsedUrl.hostname.includes(".storage.") || !parsedUrl.hostname.includes(".liara.")) {
      return "";
    }

    return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
  } catch {
    return '';
  }
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

    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("auth_token")
        : null;

    const response = await fetch('/api/uploads', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
