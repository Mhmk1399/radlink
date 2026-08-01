import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";
import { withPageAccessScope } from "@/lib/auth/resourceScope";
import { buildPageTargetUrl, createQrForPage } from "@/lib/qrCode";
import { isPageExpired } from "@/lib/pages/pageExpiration";
import { invalidatePageExpiryAlertsCache } from "@/lib/pages/pageExpiryAlertsCache";
import { sanitizePageSlug } from "@/lib/validation/pageSlug";

type RouteContext = { params: Promise<{ id: string }> };

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}

function generateDuplicateSlug(sourceUrl: unknown) {
  const sourcePart = sanitizePageSlug(sourceUrl).slice(0, 28) || "page";
  const randomPart = randomBytes(4).toString("hex");
  return `${sourcePart}-copy-${randomPart}`;
}

async function generateUniqueDuplicateSlug(sourceUrl: unknown) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = generateDuplicateSlug(sourceUrl);
    const exists = await Page.exists({ url: slug });
    if (!exists) return slug;
  }

  throw new Error("امکان ساخت دامنه تصادفی یکتا برای صفحه وجود ندارد.");
}

export const POST = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
)(async (req: AuthRequest, context: RouteContext) => {
  const user = req.ctx.user!;
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه صفحه معتبر نیست." },
      { status: 400 },
    );
  }

  if (user.role !== "admin" && user.role !== "superAdmin") {
    return NextResponse.json(
      { message: "فقط مدیر می‌تواند صفحه را بدون مالکیت کپی کند." },
      { status: 403 },
    );
  }

  const query = await withPageAccessScope(user, { _id: id }, "view");
  const sourcePage = await Page.findOne(query).lean();

  if (!sourcePage) {
    return NextResponse.json(
      { message: "صفحه پیدا نشد." },
      { status: 404 },
    );
  }

  const url = await generateUniqueDuplicateSlug(sourcePage.url);
  const title = `${String(sourcePage.title || "صفحه")} - کپی`;
  const expiresAt = sourcePage.expiresAt ?? null;
  const isPublished =
    Boolean(sourcePage.isPublished) && !isPageExpired(expiresAt);

  const page = await Page.create({
    title,
    description: sourcePage.description ?? "",
    url,
    owner: null,
    assignedUser: null,
    template: sourcePage.template,
    blocks: cloneJson(sourcePage.blocks ?? []),
    styleOverride: cloneJson(sourcePage.styleOverride ?? {}),
    background: cloneJson(sourcePage.background ?? {}),
    font: sourcePage.font,
    logo: sourcePage.logo ?? "",
    logoShape: sourcePage.logoShape === "circle" ? "circle" : "square",
    logoHeader: cloneJson(sourcePage.logoHeader ?? {}),
    footer: cloneJson(sourcePage.footer ?? {}),
    favicon: sourcePage.favicon ?? "",
    thumbnail: sourcePage.thumbnail ?? "",
    seo: {
      ...cloneJson(sourcePage.seo ?? {}),
      title: sourcePage.seo?.title ?? title,
      canonical: buildPageTargetUrl(url, req.url),
      ogImage: sourcePage.logo ?? sourcePage.seo?.ogImage ?? "",
    },
    extraServices: cloneJson(sourcePage.extraServices ?? {}),
    subscription: cloneJson(sourcePage.subscription ?? {}),
    settings: cloneJson(sourcePage.settings ?? {}),
    stats: { views: 0, visitors: 0 },
    expiresAt,
    isPublished,
    publishedAt: isPublished ? new Date() : undefined,
  });

  let qr: unknown = null;
  try {
    qr = await createQrForPage({
      pageId: String(page._id),
      creatorId: String(user._id),
      pageUrl: page.url,
      requestUrl: req.url,
    });
  } catch (error) {
    console.error("ساخت کد کیوآر صفحه کپی‌شده با خطا مواجه شد.", error);
  }

  const populatedPage = await Page.findById(page._id)
    .populate("owner", "firstName lastName email phoneNumber")
    .populate("assignedUser", "firstName lastName email phoneNumber")
    .populate("template", "name thumbnail category")
    .lean({ virtuals: true });

  revalidatePath(`/${page.url}`);
  revalidatePath("/[url]", "page");
  revalidatePath("/sitemap.xml");
  invalidatePageExpiryAlertsCache();

  return NextResponse.json(
    { page: populatedPage ?? page, qr },
    { status: 201 },
  );
});
