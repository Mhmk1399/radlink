import { NextResponse } from "next/server";
import type { AuthRequest } from "@/lib/auth/types";
import {
  getAccessActionLabel,
  getAccessComponentLabel,
  getAccessResourceLabel,
  getAccessTargetForRequest,
  type RequestAccessTarget,
} from "@/lib/auth/accessRules";
import type { AccessActionValue } from "@/lib/auth/accessCatalog";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";

type AccessDeniedTarget = Partial<RequestAccessTarget> & {
  action: AccessActionValue;
};

export const AUTH_MESSAGES = {
  unauthorized: "برای انجام این عملیات ابتدا وارد حساب کاربری شوید.",
  invalidToken: "نشست شما معتبر نیست. لطفا دوباره وارد شوید.",
  userNotFound: "کاربر یافت نشد.",
  phoneNotVerified: "شماره موبایل شما تایید نشده است.",
  insufficientRole: "نقش کاربری شما اجازه انجام این عملیات را ندارد.",
  accountStatusNotAllowed: "وضعیت حساب کاربری شما اجازه انجام این عملیات را ندارد.",
  agentNotFound: "پروفایل نماینده یافت نشد.",
  agentInactive: "حساب نماینده غیرفعال است.",
} as const;

export function buildAccessDeniedPayload(target?: AccessDeniedTarget) {
  const actionLabel = target ? getAccessActionLabel(target.action) : "انجام عملیات";
  const subjectLabel =
    target?.component
      ? getAccessComponentLabel(target.component)
      : getAccessResourceLabel(target?.resource);

  return {
    code: "ACCESS_DENIED",
    message: `شما دسترسی ${actionLabel} برای «${subjectLabel}» را ندارید.`,
    requiredAccess: target
      ? {
          component: target.component,
          componentLabel: target.component
            ? getAccessComponentLabel(target.component)
            : undefined,
          action: target.action,
          actionLabel,
          resource: target.resource,
          resourceId: target.resourceId,
        }
      : undefined,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { code: "UNAUTHORIZED", message: AUTH_MESSAGES.unauthorized },
    { status: 401 },
  );
}

export function forbiddenAccessResponse(target?: AccessDeniedTarget) {
  return NextResponse.json(buildAccessDeniedPayload(target), { status: 403 });
}

export async function evaluateRequestAccess(req: AuthRequest) {
  const target = getAccessTargetForRequest(
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req.method,
  );

  if (!target) {
    return { matched: false, granted: true, target: null };
  }

  const user = req.ctx?.user;
  if (!user) {
    return { matched: true, granted: false, target };
  }

  if (user.role === "superAdmin") {
    return { matched: true, granted: true, target };
  }

  const resolved = await resolveUserAccess(String(user._id), user.permissions);
  const componentGranted =
    resolved.components[target.component]?.has(target.action) ?? false;
  const resourceGranted =
    target.resource && target.resourceId
      ? (resolved[target.resource][target.resourceId]?.has(target.action) ??
        false)
      : false;

  return {
    matched: true,
    granted: componentGranted || resourceGranted,
    target,
  };
}

export async function enforceRequestAccess(req: AuthRequest) {
  const result = await evaluateRequestAccess(req);

  if (!result.matched || result.granted) return null;

  if (!req.ctx?.user) {
    return unauthorizedResponse();
  }

  return forbiddenAccessResponse(result.target ?? undefined);
}
