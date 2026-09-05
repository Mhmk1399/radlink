import { NextResponse } from "next/server";
import type { IUser } from "@/models/users";
import Agent from "@/models/agent";
import FileModel from "@/models/files";
import Page from "@/models/pages";

export type QuotaResource = "files" | "pages" | "blocks";

export type QuotaStatus = {
  resource: QuotaResource;
  limit: number;
  used: number;
  requested: number;
  unlimited: boolean;
  allowed: boolean;
  remaining: number | null;
};

const RESOURCE_LABELS: Record<QuotaResource, string> = {
  files: "فایل",
  pages: "صفحه",
  blocks: "بلاک در هر صفحه",
};

function normalizeLimit(value: unknown) {
  const limit = Number(value);
  return Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
}

function normalizeLimits(value: unknown) {
  const limits =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    files: normalizeLimit(limits.files),
    blocks: normalizeLimit(limits.blocks),
    pages: normalizeLimit(limits.pages),
  };
}

async function resolveEffectiveLimits(
  user: Pick<
    IUser,
    "_id" | "role" | "limits" | "agentid" | "limitsOverrideEnabled"
  >,
) {
  if (!user.agentid || user.limitsOverrideEnabled) {
    return normalizeLimits(user.limits);
  }

  const agent = await Agent.findById(user.agentid).select("limits").lean();
  return normalizeLimits(agent?.limits ?? user.limits);
}

async function getPersistedUsage(userId: string, resource: QuotaResource) {
  if (resource === "files") {
    return FileModel.countDocuments({
      owner: userId,
      kind: { $in: ["upload", "logo-header", "ticket"] },
    });
  }

  if (resource === "pages") {
    return Page.countDocuments({
      $or: [{ owner: userId }, { assignedUser: userId }],
    });
  }

  return 0;
}

export async function checkUserQuota({
  user,
  resource,
  amount = 1,
  absoluteUsage,
  currentUsage,
}: {
  user: Pick<
    IUser,
    "_id" | "role" | "limits" | "agentid" | "limitsOverrideEnabled"
  >;
  resource: QuotaResource;
  amount?: number;
  absoluteUsage?: number;
  currentUsage?: number;
}): Promise<QuotaStatus> {
  const effectiveLimits = await resolveEffectiveLimits(user);
  const limit = normalizeLimit(effectiveLimits[resource]);
  const unlimited = user.role === "superAdmin" || limit === 0;
  const used =
    resource === "blocks"
      ? Math.max(0, Math.floor(currentUsage ?? absoluteUsage ?? 0))
      : await getPersistedUsage(String(user._id), resource);
  const requested =
    absoluteUsage === undefined
      ? used + Math.max(0, Math.floor(amount))
      : Math.max(0, Math.floor(absoluteUsage));
  const allowed = unlimited || requested <= limit;

  return {
    resource,
    limit,
    used,
    requested,
    unlimited,
    allowed,
    remaining: unlimited ? null : Math.max(0, limit - used),
  };
}

export function quotaExceededResponse(status: QuotaStatus) {
  const label = RESOURCE_LABELS[status.resource];

  return NextResponse.json(
    {
      code: "QUOTA_EXCEEDED",
      message: `سقف مجاز ${label} شما تکمیل شده است. حد مجاز: ${status.limit}، مقدار درخواستی: ${status.requested}.`,
      quota: status,
    },
    { status: 403 },
  );
}
