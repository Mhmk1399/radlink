import { randomBytes } from "crypto";
import QRCode from "qrcode";
import {
    deleteLiaraObject,
    uploadLiaraObject,
} from "@/lib/liaraStorage";
import File from "@/models/files";
import { extractKeyFromUrl } from "@/lib/fileUtils";
import QR from "@/models/qr";

const SHORTCODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function buildPageTargetUrl(pageUrl: string, requestUrl?: string) {
    const trimmedPageUrl = pageUrl.trim();

    if (/^https?:\/\//i.test(trimmedPageUrl)) {
        return trimmedPageUrl;
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        (requestUrl ? new URL(requestUrl).origin : "");

    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const normalizedPath = `/${trimmedPageUrl.replace(/^\/+/, "")}`;

    return normalizedBaseUrl
        ? `${normalizedBaseUrl}${normalizedPath}`
        : normalizedPath;
}

export async function generateQrImageDataUrl(targetUrl: string) {
    return QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 8,
        type: "image/png",
        width: 512,
    });
}

export async function generateQrImageBuffer(targetUrl: string) {
    return QRCode.toBuffer(targetUrl, {
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 8,
        type: "png",
        width: 512,
    });
}

function generateShortcode(length = 8) {
    const bytes = randomBytes(length);

    return Array.from(bytes)
        .map((byte) => SHORTCODE_ALPHABET[byte % SHORTCODE_ALPHABET.length])
        .join("");
}

export async function generateUniqueQrShortcode(length = 8) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
        const shortcode = generateShortcode(length);
        const exists = await QR.exists({ shortcode });

        if (!exists) return shortcode;
    }

    throw new Error("امکان ساخت کد یکتای کیوآر وجود ندارد.");
}

export async function createQrForPage({
    pageId,
    creatorId,
    pageUrl,
    requestUrl,
}: {
    pageId: string;
    creatorId: string;
    pageUrl: string;
    requestUrl?: string;
}) {
    const existingQr = await QR.findOne({ page: pageId }).lean();
    const targetUrl = buildPageTargetUrl(pageUrl, requestUrl);
    if (existingQr?.targetUrl === targetUrl && existingQr.imageurl) return existingQr;
    const [imageBuffer, shortcode] = await Promise.all([
        generateQrImageBuffer(targetUrl),
        existingQr ? Promise.resolve(existingQr.shortcode) : generateUniqueQrShortcode(),
    ]);

    const filename = existingQr
        ? `qr-${shortcode}-${randomBytes(6).toString("hex")}.png`
        : `qr-${shortcode}.png`;
    const key = `rad/qrcodes/${filename}`;
    const uploaded = await uploadLiaraObject({
        key,
        body: imageBuffer,
        contentType: "image/png",
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
            originalName: filename,
            uploadedAt: new Date().toISOString(),
            fileSize: imageBuffer.length.toString(),
            pageId,
            creatorId,
        },
    });

    let fileId: string | null = null;

    try {
        const file = await File.create({
            filename,
            path: uploaded.url,
            owner: existingQr?.owner ?? creatorId,
            mimeType: "image/png",
            size: imageBuffer.length,
            kind: "qr",
            page: pageId,
        });
        fileId = String(file._id);

        if (existingQr) {
            const updated = await QR.findByIdAndUpdate(existingQr._id, {
                $set: { targetUrl, imageurl: uploaded.url, file: file._id },
            }, { new: true, runValidators: true });
            if (!updated) throw new Error("کد کیوآر صفحه پیدا نشد.");

            // The replacement has a new URL so immutable browser/CDN caches stay correct.
            if (existingQr.file) {
                const oldFile = await File.findById(existingQr.file).lean().catch(() => null);
                if (oldFile?.kind === "qr") {
                    const oldKey = extractKeyFromUrl(oldFile.path);
                    if (oldKey) {
                        await deleteLiaraObject(oldKey)
                            .then(() => File.findByIdAndDelete(oldFile._id))
                            .catch(() => null);
                    }
                }
            }
            return updated;
        }

        return await QR.create({
            page: pageId,
            owner: creatorId,
            file: file._id,
            targetUrl,
            imageurl: uploaded.url,
            shortcode,
        });
    } catch (error) {
        if (fileId) {
            await File.findByIdAndDelete(fileId).catch(() => null);
        }
        await deleteLiaraObject(uploaded.key).catch(() => null);
        throw error;
    }
}
