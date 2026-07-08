import { NextResponse } from "next/server";
import { getLiaraEndpoint } from "@/lib/s3";
import { deleteLiaraObject, uploadLiaraObject } from "@/lib/liaraStorage";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import {
    checkUserQuota,
    quotaExceededResponse,
} from "@/lib/auth/quota";
import FileModel from "@/models/files";

// Allowed file types and size limits
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

function jsonError(message: string, status = 500, extra?: Record<string, unknown>) {
    return NextResponse.json(
        { success: false, message, error: message, ...(extra ?? {}) },
        { status }
    );
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const activeEndpoint = getLiaraEndpoint();

    try {
        const quota = await checkUserQuota({
            user: req.ctx.user!,
            resource: "files",
        });
        if (!quota.allowed) return quotaExceededResponse(quota);

        // Check if required environment variables are set
        if (!process.env.LIARA_BUCKET_NAME) {
            console.log("LIARA_BUCKET_NAME environment variable is not set");
            return jsonError("تنظیمات آپلود روی سرور کامل نیست.", 500);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const requestedKind = formData.get("kind");
        const kind =
            requestedKind === "ticket"
                ? "ticket"
                : requestedKind === "logo-header"
                    ? "logo-header"
                    : "upload";

        if (!file) {
            return jsonError("فایلی برای آپلود ارسال نشده است.", 400);
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return jsonError("نوع فایل انتخاب‌شده مجاز نیست.", 400, {
                allowedTypes: ALLOWED_TYPES,
                receivedType: file.type,
            });
        }

        // Validate file size
        const maxFileSize = file.type.startsWith("video/")
            ? MAX_VIDEO_SIZE
            : MAX_FILE_SIZE;
        if (file.size > maxFileSize) {
            return jsonError("حجم فایل بیش از حد مجاز است.", 400, {
                maxFileSize,
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);

        // Extract file extension
        const extension = file.name.includes(".")
            ? `.${file.name.split(".").pop() || ""}`
            : "";

        // Check if filename contains non-ASCII characters (e.g., Persian)
        const hasNonAscii = /[^\x00-\x7F]/.test(file.name);

        let cleanFileName: string;
        if (hasNonAscii) {
            // If non-ASCII (e.g., Persian), generate a fully English name without original filename
            cleanFileName = `${timestamp}_${randomId}${extension}`;
            console.log(
                `Non-ASCII filename detected: ${file.name}. Using generated name: ${cleanFileName}`
            );
        } else {
            // Otherwise, use the existing cleaning logic
            cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            cleanFileName = `${timestamp}_${randomId}_${cleanFileName}`;
        }

        const key = `rad/${cleanFileName}`;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // URL-encode metadata values to handle special characters (e.g., Persian in originalName)
        // Upload to Liara Object Storage
        const uploadResult = await uploadLiaraObject({
            key,
            body: buffer,
            contentType: file.type,
            metadata: {
                originalName: encodeURIComponent(file.name),
                uploadedAt: new Date().toISOString(),
                fileSize: file.size.toString(),
            },
            cacheControl: "public, max-age=31536000, immutable",
        });

        // Generate public URL for Liara Object Storage

        const publicUrl = uploadResult.url;
        let fileDoc;
        try {
            fileDoc = await FileModel.create({
                filename: file.name,
                path: publicUrl,
                owner: req.ctx.user!._id,
                mimeType: file.type,
                size: file.size,
                kind,
            });
        } catch (error) {
            await deleteLiaraObject(key).catch(() => null);
            throw error;
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
            file: fileDoc,
            data: {
                file: fileDoc,
                fileId: String(fileDoc._id),
                key,
                url: publicUrl,
                originalName: file.name, // Return unencoded for user convenience
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
            },
            message: "فایل با موفقیت آپلود شد.",
        });
    } catch (error) {
        console.log("Upload error:", error);

        // Handle specific Liara Object Storage errors
        if (error instanceof Error) {
            if (error.name === "NoSuchBucket") {
                return jsonError("باکت لیارا پیدا نشد.", 500);
            }

            if (error.name === "AccessDenied") {
                return jsonError("دسترسی به باکت لیارا رد شد.", 500);
            }

            if (
                error.name === "CredentialsError" ||
                error.name === "InvalidAccessKeyId"
            ) {
                return jsonError("کلیدهای دسترسی لیارا معتبر نیستند.", 500);
            }

            if (
                "code" in error &&
                (error as { code?: string }).code === "ECONNREFUSED"
            ) {
                return jsonError(
                    "اتصال به Object Storage لیارا برقرار نشد. مقدار LIARA_ENDPOINT را با endpoint بخش SDK باکت در پنل لیارا بررسی کنید.",
                    502,
                    { endpoint: activeEndpoint }
                );
            }

            // Return the actual error message for debugging
            return jsonError(`آپلود فایل با خطا مواجه شد: ${error.message}`, 500);
        }

        return jsonError("آپلود فایل با خطا مواجه شد.", 500);
    }
});

// GET endpoint to check upload service status
export async function GET() {
    try {
        const activeEndpoint = getLiaraEndpoint();
        const requiredVars = [
            "LIARA_BUCKET_NAME",
            "LIARA_ENDPOINT",
            "LIARA_ACCESS_KEY",
            "LIARA_SECRET_KEY",
        ];
        const missingVars = requiredVars.filter((varName) => !process.env[varName]);

        if (missingVars.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing environment variables",
                    missing: missingVars,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Liara Object Storage upload service is configured and ready",
            config: {
                bucket: process.env.LIARA_BUCKET_NAME,
                endpoint: process.env.LIARA_ENDPOINT,
                activeEndpoint,
                allowedTypes: ALLOWED_TYPES,
                maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
                maxVideoSize: `${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
            },
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to check service status",
            },
            { status: 500 }
        );
    }
}
