import Page from "@/models/pages";
import Product from "@/models/products";
import { syncPageProducts } from "@/lib/products/syncPageProducts";
import {
  AUTO_PAGE_ASSIGNMENT_DELAY_MS,
  AUTO_PAGE_ASSIGNMENT_SOURCE,
  getActiveAutoPageAssignmentTarget,
} from "@/lib/settings/autoPageAssignment";
import { invalidatePageExpiryAlertsCache } from "@/lib/pages/pageExpiryAlertsCache";

type AutoAssignResultBase = {
  checked: number;
  assigned: number;
  targetUserId?: string;
  source: typeof AUTO_PAGE_ASSIGNMENT_SOURCE;
  startedAt: string;
  finishedAt: string;
};

export type AutoAssignUnownedPagesResult =
  | (AutoAssignResultBase & { ok: true })
  | (AutoAssignResultBase & {
      ok: false;
      code: string;
      message: string;
    });

function getUnassignedEligibleQuery(now: Date) {
  const createdBefore = new Date(now.getTime() - AUTO_PAGE_ASSIGNMENT_DELAY_MS);

  return {
    owner: null,
    assignedUser: null,
    $or: [
      { autoAssignAt: { $lte: now } },
      {
        autoAssignAt: { $exists: false },
        createdAt: { $lte: createdBefore },
      },
    ],
  };
}

export async function autoAssignUnownedPages24h(): Promise<AutoAssignUnownedPagesResult> {
  const startedAtDate = new Date();
  const startedAt = startedAtDate.toISOString();
  const targetResult = await getActiveAutoPageAssignmentTarget();

  if (!targetResult.ok) {
    const result = {
      ok: false as const,
      code: targetResult.code,
      message: targetResult.message,
      checked: 0,
      assigned: 0,
      source: AUTO_PAGE_ASSIGNMENT_SOURCE as typeof AUTO_PAGE_ASSIGNMENT_SOURCE,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    console.warn("[AUTO_24H_PAGE_ASSIGNMENT]", result);
    return result;
  }

  const targetUserId = String(targetResult.user._id);
  const now = new Date();
  const query = getUnassignedEligibleQuery(now);
  const checked = await Page.countDocuments(query);
  let assigned = 0;
  let syncedProducts = 0;
  let productSyncFailures = 0;

  while (true) {
    const page = await Page.findOneAndUpdate(
      query,
      {
        $set: {
          owner: targetUserId,
          autoAssignAt: now,
        },
      },
      {
        new: true,
        sort: { autoAssignAt: 1, createdAt: 1, _id: 1 },
      },
    ).select("_id blocks");

    if (!page) break;

    assigned += 1;

    try {
      await Product.updateMany(
        { page: page._id, source: "builder" },
        { $set: { owner: targetUserId } },
      );
      await syncPageProducts({
        pageId: page._id,
        ownerId: targetUserId,
        blocks: page.blocks,
      });
      syncedProducts += 1;
    } catch (error) {
      productSyncFailures += 1;
      console.error(
        "[AUTO_24H_PAGE_ASSIGNMENT] همگام‌سازی محصولات صفحه با خطا مواجه شد.",
        {
          pageId: String(page._id),
          targetUserId,
          error,
        },
      );
    }
  }

  if (assigned > 0) {
    invalidatePageExpiryAlertsCache();
  }

  const result = {
    ok: true as const,
    checked,
    assigned,
    targetUserId,
    source: AUTO_PAGE_ASSIGNMENT_SOURCE as typeof AUTO_PAGE_ASSIGNMENT_SOURCE,
    startedAt,
    finishedAt: new Date().toISOString(),
  };

  console.info("[AUTO_24H_PAGE_ASSIGNMENT]", {
    ...result,
    syncedProducts,
    productSyncFailures,
  });

  return result;
}
