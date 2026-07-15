import { forbiddenAccessResponse } from "@/lib/auth/enforceAccess";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import type { AuthRequest } from "@/lib/auth/types";

export async function assertPagePublishAccess(
  req: AuthRequest,
  pageId?: string,
) {
  const user = req.ctx?.user;
  if (!user || user.role === "superAdmin") return null;

  const resolved = await resolveUserAccess(String(user._id), user.permissions);
  const hasGlobalPublish =
    resolved.components["admin.pages"]?.has("publish") ?? false;
  const hasPagePublish = pageId
    ? (resolved.pages[pageId]?.has("publish") ?? false)
    : false;

  if (hasGlobalPublish || hasPagePublish) return null;

  return forbiddenAccessResponse({
    component: "admin.pages",
    resource: "pages",
    resourceId: pageId,
    action: "publish",
  });
}
