"use client";

type AccessMap = {
  components?: Record<string, string[]>;
  templates?: Record<string, string[]>;
  pages?: Record<string, string[]>;
};

type MeResponse = {
  user?: {
    role?: string;
  };
  access?: AccessMap;
};

export type BuilderAccessTarget =
  | { kind: "page-create" }
  | { kind: "page-edit"; pageId: string }
  | { kind: "template-create" }
  | { kind: "template-edit"; templateId: string };

export type BuilderAuthorizationResult =
  | { ok: true; token: string; me: MeResponse }
  | { ok: false; reason: "missing-token" | "unauthorized" | "forbidden"; message: string };

export function getBuilderAuthToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("auth_token") ??
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("jwt") ??
    ""
  );
}

function hasAction(
  access: AccessMap | undefined,
  bucket: keyof AccessMap,
  key: string,
  action: string,
) {
  return access?.[bucket]?.[key]?.includes(action) ?? false;
}

function canUseBuilder(me: MeResponse, target: BuilderAccessTarget) {
  if (me.user?.role === "superAdmin") return true;

  const access = me.access;

  if (target.kind === "page-create") {
    return hasAction(access, "components", "builder.page", "create");
  }

  if (target.kind === "page-edit") {
    return (
      hasAction(access, "components", "builder.page", "update") ||
      hasAction(access, "pages", target.pageId, "update")
    );
  }

  if (target.kind === "template-create") {
    return hasAction(access, "components", "builder.template", "create");
  }

  return (
    hasAction(access, "components", "builder.template", "update") ||
    hasAction(access, "templates", target.templateId, "update")
  );
}

function forbiddenMessage(target: BuilderAccessTarget) {
  if (target.kind === "template-create") {
    return "شما دسترسی ساخت تمپلیت در صفحه‌ساز را ندارید.";
  }
  if (target.kind === "template-edit") {
    return "شما دسترسی ویرایش این تمپلیت را ندارید.";
  }
  if (target.kind === "page-edit") {
    return "شما دسترسی ویرایش این صفحه را ندارید.";
  }
  return "شما دسترسی ساخت صفحه در صفحه‌ساز را ندارید.";
}

export async function authorizeBuilderAccess(
  target: BuilderAccessTarget,
): Promise<BuilderAuthorizationResult> {
  const token = getBuilderAuthToken();

  if (!token) {
    return {
      ok: false,
      reason: "missing-token",
      message: "برای ورود به صفحه‌ساز ابتدا وارد حساب کاربری شوید.",
    };
  }

  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await response.json().catch(() => null)) as MeResponse | null;

  if (!response.ok || !json) {
    return {
      ok: false,
      reason: "unauthorized",
      message:
        response.status === 401
          ? "نشست شما منقضی شده است. دوباره وارد شوید."
          : "برای استفاده از صفحه‌ساز ابتدا وارد حساب کاربری شوید.",
    };
  }

  if (!canUseBuilder(json, target)) {
    return {
      ok: false,
      reason: "forbidden",
      message: forbiddenMessage(target),
    };
  }

  return { ok: true, token, me: json };
}
