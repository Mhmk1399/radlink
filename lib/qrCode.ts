import { randomBytes } from "crypto";
import QRCode from "qrcode";
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
    const [imageurl, shortcode] = await Promise.all([
        generateQrImageDataUrl(targetUrl),
        generateUniqueQrShortcode(),
    ]);

    return QR.create({
        page: pageId,
        owner: creatorId,
        targetUrl,
        imageurl,
        shortcode,
    });
}
