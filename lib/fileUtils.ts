// Utility functions for Liara Object Storage file URL management

export interface LiaraFileInfo {
  key: string;
  url: string;
  fileId: string;
  file: {
    _id?: string;
    id?: string;
    filename: string;
    path: string;
    owner?: string;
  };
  originalName?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

export type UploadFileKind = "upload" | "ticket" | "logo-header";
export const FILE_UPLOADED_EVENT = "radlink:file-uploaded";

export type FileUploadedEventDetail = {
  fileId: string;
  url: string;
};

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
 * Extract file key from a Liara Object Storage URL. Handles both the raw
 * `*.storage.*.liara.*` domain and a configured custom/CDN base domain
 * (LIARA_PUBLIC_URL / NEXT_PUBLIC_LIARA_PUBLIC_URL / NEXT_PUBLIC_STORAGE_URL),
 * since uploaded file URLs are built against whichever base was configured
 * at upload time.
 * @param url - Stored file URL
 * @returns File key, or "" if the URL doesn't belong to Object Storage
 */
export function extractKeyFromUrl(url: string): string {
  if (!url) return "";

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return "";
  }

  const configuredBases = [
    process.env.LIARA_PUBLIC_URL,
    process.env.NEXT_PUBLIC_LIARA_PUBLIC_URL,
    process.env.NEXT_PUBLIC_STORAGE_URL,
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const rawBase of configuredBases) {
    try {
      const base = new URL(rawBase.replace(/\/+$/, ""));
      if (base.hostname !== parsedUrl.hostname) continue;

      const basePath = base.pathname.replace(/\/+$/, "");
      const keyPath =
        basePath && parsedUrl.pathname.startsWith(basePath)
          ? parsedUrl.pathname.slice(basePath.length)
          : parsedUrl.pathname;

      return decodeURIComponent(keyPath.replace(/^\/+/, ""));
    } catch {
      // Malformed configured base — ignore and try the next candidate.
    }
  }

  const isRawLiaraStorageUrl =
    parsedUrl.hostname.includes(".storage.") &&
    parsedUrl.hostname.includes(".liara.");

  if (!isRawLiaraStorageUrl) return "";

  return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
}

/**
 * Upload a file to Liara Object Storage and get back the file info
 * @param file - File object to upload
 * @returns Promise with upload response
 */
export async function uploadFile(
  file: File,
  options?: { kind?: UploadFileKind },
): Promise<LiaraFileInfo> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

  if (!token) {
    throw new Error("برای آپلود فایل ابتدا وارد حساب کاربری شوید.");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (options?.kind) {
    formData.append("kind", options.kind);
  }

  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error || "آپلود فایل با خطا مواجه شد.",
    );
  }

  const data = result.data;
  const fileRecord = result.file ?? data?.file;
  const url = normalizeLiaraUrl(
    result.url ?? data?.url ?? fileRecord?.path ?? "",
  );
  const fileId = String(
    data?.fileId ?? fileRecord?._id ?? fileRecord?.id ?? "",
  );

  if (!url || !fileId || !fileRecord) {
    throw new Error("اطلاعات فایل ذخیره‌شده از سرور دریافت نشد.");
  }

  const uploadedFileInfo: LiaraFileInfo = {
    key: String(data?.key ?? ""),
    url,
    fileId,
    file: {
      ...fileRecord,
      _id: String(fileRecord._id ?? fileRecord.id ?? fileId),
      filename: String(fileRecord.filename ?? file.name),
      path: url,
      owner:
        fileRecord.owner === undefined ? undefined : String(fileRecord.owner),
    },
    originalName: String(data?.originalName ?? file.name),
    size: Number(data?.size ?? file.size),
    type: String(data?.type ?? file.type),
    uploadedAt: String(data?.uploadedAt ?? new Date().toISOString()),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<FileUploadedEventDetail>(FILE_UPLOADED_EVENT, {
        detail: { fileId, url },
      }),
    );
  }

  return uploadedFileInfo;
}

/**
 * Delete a previously uploaded file — removes both the Object Storage
 * object and its database record. Identify the file by fileId (preferred)
 * or by its stored URL when the fileId isn't known on the client.
 * @param identifier - fileId and/or url of the file to delete
 */
export async function deleteFile(identifier: {
  fileId?: string;
  url?: string;
}): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_token")
      : null;

  if (!token) {
    throw new Error("برای حذف فایل ابتدا وارد حساب کاربری شوید.");
  }

  const fileId = identifier.fileId?.trim();
  const url = identifier.url?.trim();

  if (!fileId && !url) {
    throw new Error("شناسه یا آدرس فایل نامعتبر است.");
  }

  const response = await fetch("/api/uploads/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileId, url }),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error || "حذف فایل با خطا مواجه شد.",
    );
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
