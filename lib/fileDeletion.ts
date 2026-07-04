import "server-only";

import File from "@/models/files";
import type { IUser } from "@/models/users";
import { canAccessActorOwner } from "@/lib/auth/agentScope";
import { deleteLiaraObject } from "@/lib/liaraStorage";
import { extractKeyFromUrl } from "@/lib/fileUtils";

export class FileDeletionError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "FileDeletionError";
    this.status = status;
    this.code = code;
  }
}

type StorageErrorLike = {
  name?: string;
  code?: string;
  Code?: string;
};

function isMissingObjectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { name, code, Code } = error as StorageErrorLike;
  return [name, code, Code].some(
    (value) => value === "NoSuchKey" || value === "NotFound",
  );
}

function mapStorageError(error: unknown): FileDeletionError {
  if (error instanceof Error) {
    if (error.name === "AccessDenied") {
      return new FileDeletionError(
        "دسترسی به باکت لیارا برای حذف فایل رد شد.",
        502,
        "STORAGE_ACCESS_DENIED",
      );
    }
    if (error.name === "NoSuchBucket") {
      return new FileDeletionError(
        "باکت لیارا پیدا نشد.",
        502,
        "STORAGE_BUCKET_NOT_FOUND",
      );
    }
    if (
      error.name === "CredentialsError" ||
      error.name === "InvalidAccessKeyId"
    ) {
      return new FileDeletionError(
        "کلیدهای دسترسی لیارا معتبر نیستند.",
        502,
        "STORAGE_INVALID_CREDENTIALS",
      );
    }
    if (
      "code" in error &&
      (error as { code?: string }).code === "ECONNREFUSED"
    ) {
      return new FileDeletionError(
        "اتصال به Object Storage لیارا برقرار نشد.",
        502,
        "STORAGE_CONNECTION_FAILED",
      );
    }
    return new FileDeletionError(
      `حذف فایل از Object Storage با خطا مواجه شد: ${error.message}`,
      502,
      "STORAGE_DELETE_FAILED",
    );
  }
  return new FileDeletionError(
    "حذف فایل از Object Storage با خطا مواجه شد.",
    502,
    "STORAGE_DELETE_FAILED",
  );
}

export type FileIdentifier = { fileId?: string; url?: string };
type Actor = Pick<IUser, "_id" | "role">;

export type DeletedFileResult = {
  fileId: string;
  key: string;
  filename: string;
};

// Deletes a File record by id or by its exact stored URL, removing the
// underlying Object Storage object first. A missing storage object is not
// treated as fatal (the DB record is still cleaned up); any other storage
// failure aborts before the DB record is touched so the two stay in sync.
export async function deleteFileByIdentifier(
  identifier: FileIdentifier,
  actor: Actor,
): Promise<DeletedFileResult> {
  const fileId = identifier.fileId?.trim();
  const url = identifier.url?.trim();

  if (!fileId && !url) {
    throw new FileDeletionError(
      "شناسه یا آدرس فایل ارسال نشده است.",
      400,
      "FILE_IDENTIFIER_REQUIRED",
    );
  }

  const file = fileId
    ? await File.findById(fileId)
    : await File.findOne({ path: url });

  if (!file) {
    throw new FileDeletionError("فایل پیدا نشد.", 404, "FILE_NOT_FOUND");
  }

  if (!(await canAccessActorOwner(actor, file.owner))) {
    throw new FileDeletionError(
      "اجازه حذف این فایل را ندارید.",
      403,
      "FORBIDDEN",
    );
  }

  const key = extractKeyFromUrl(file.path);

  // Every File record's `path` points at Object Storage, so a resolvable key
  // must exist. Failing loudly here beats silently deleting only the DB row
  // and leaving the object orphaned in the bucket.
  if (!key) {
    throw new FileDeletionError(
      "کلید فایل در Object Storage قابل تشخیص نیست.",
      422,
      "STORAGE_KEY_UNRESOLVED",
    );
  }

  try {
    await deleteLiaraObject(key);
  } catch (error) {
    if (!isMissingObjectError(error)) {
      throw mapStorageError(error);
    }
  }

  await file.deleteOne();

  return { fileId: String(file._id), key, filename: file.filename };
}
