import { randomBytes } from "crypto";
import QRCode from "qrcode";
import {
    deleteLiaraObject,
    uploadLiaraObject,
} from "@/lib/liaraStorage";
import File from "@/models/files";
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

    throw new Error("امکان ساخت کد یکتای QR وجود ندارد.");
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
    if (existingQr) return existingQr;

    const targetUrl = buildPageTargetUrl(pageUrl, requestUrl);
    const [imageBuffer, shortcode] = await Promise.all([
        generateQrImageBuffer(targetUrl),
        generateUniqueQrShortcode(),
    ]);

    const filename = `qr-${shortcode}.png`;
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
            owner: creatorId,
            mimeType: "image/png",
            size: imageBuffer.length,
            kind: "qr",
            page: pageId,
        });
        fileId = String(file._id);

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
