import {
  ACCESS_ACTIONS,
  STATIC_COMPONENT_CATALOG,
  type AccessActionValue,
} from "@/lib/auth/accessCatalog";

export type AccessResource = "templates" | "blocks" | "pages";

export type RequestAccessTarget = {
  component: string;
  action: AccessActionValue;
  resource?: AccessResource;
  resourceId?: string;
};

const API_COMPONENT_RULES = [
  { prefix: "/api/admin/dashboard", component: "admin.dashboard" },
  { prefix: "/api/users", component: "admin.users" },
  { prefix: "/api/agents", component: "admin.agents" },
  { prefix: "/api/permissions", component: "admin.permissions" },
  { prefix: "/api/accesses", component: "admin.accesses" },
  { prefix: "/api/pages", component: "admin.pages", resource: "pages" },
  { prefix: "/api/templates", component: "admin.templates", resource: "templates" },
  { prefix: "/api/blocks", component: "admin.blocks", resource: "blocks" },
  { prefix: "/api/categories", component: "admin.categories" },
  { prefix: "/api/files", component: "admin.files" },
  { prefix: "/api/uploads/template-thumbnail", component: "admin.templates" },
  { prefix: "/api/uploads", component: "admin.files" },
  { prefix: "/api/qr", component: "admin.qrcodes" },
  { prefix: "/api/qrcodes", component: "admin.qrcodes" },
  { prefix: "/api/products", component: "admin.products" },
  { prefix: "/api/tickets", component: "admin.tickets" },
  { prefix: "/api/notifications", component: "admin.notifications" },
] as const;

function parsePathOrUrl(pathOrUrl: string) {
  try {
    const url = new URL(pathOrUrl, "http://local");
    return { pathname: url.pathname, searchParams: url.searchParams };
  } catch {
    const [pathname, search = ""] = pathOrUrl.split("?");
    return {
      pathname: pathname || pathOrUrl,
      searchParams: new URLSearchParams(search),
    };
  }
}

function normalizePath(pathOrUrl: string) {
  return parsePathOrUrl(pathOrUrl).pathname;
}

export function actionFromMethod(
  method: string,
  pathname = "",
): AccessActionValue {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === "/api/blocks/sync") return "update";
  if (normalizedPath === "/api/uploads/template-thumbnail") return "update";

  if (normalizedMethod === "GET") return "view";
  if (normalizedMethod === "POST") return "create";
  if (normalizedMethod === "PATCH" || normalizedMethod === "PUT") return "update";
  if (normalizedMethod === "DELETE") return "delete";
  return "view";
}

function extractResourceId(pathname: string, prefix: string) {
  const rest = pathname.slice(prefix.length).replace(/^\/+/, "");
  const firstSegment = rest.split("/")[0];

  if (!firstSegment || firstSegment === "sync") return undefined;
  return firstSegment;
}

export function getAccessTargetForRequest(
  pathOrUrl: string,
  method: string,
): RequestAccessTarget | null {
  const { pathname, searchParams } = parsePathOrUrl(pathOrUrl);
  const normalizedMethod = method.toUpperCase();

  if (
    pathname === "/api/categories" &&
    normalizedMethod === "GET" &&
    searchParams.get("mode") === "options"
  ) {
    return {
      component: "admin.templates",
      action: "view",
    };
  }

  if (
    pathname === "/api/users" &&
    normalizedMethod === "GET" &&
    searchParams.get("mode") === "agent-options"
  ) {
    return {
      component: "admin.agents",
      action: "create",
    };
  }

  if (
    pathname === "/api/blocks" &&
    normalizedMethod === "GET" &&
    searchParams.get("mode") === "builder"
  ) {
    return null;
  }

  if (
    (pathname === "/api/tickets" || pathname.startsWith("/api/tickets/")) &&
    normalizedMethod === "GET"
  ) {
    return null;
  }

  if (pathname === "/api/tickets" && normalizedMethod === "POST") {
    return null;
  }

  if (pathname === "/api/uploads" && normalizedMethod === "POST") {
    return null;
  }

  const rule = API_COMPONENT_RULES.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
  );

  if (!rule) return null;

  const target: RequestAccessTarget = {
    component: rule.component,
    action: actionFromMethod(method, pathname),
  };

  if ("resource" in rule) {
    const resourceId = extractResourceId(pathname, rule.prefix);
    if (resourceId) {
      target.resource = rule.resource;
      target.resourceId = resourceId;
    }
  }

  return target;
}

export function adminComponentForSection(section: string) {
  return `admin.${section}`;
}

export function getAccessActionLabel(action: AccessActionValue) {
  return (
    ACCESS_ACTIONS.find((item) => item.value === action)?.label ?? action
  );
}

export function getAccessComponentLabel(component?: string) {
  if (!component) return "این بخش";
  return (
    STATIC_COMPONENT_CATALOG.find((item) => item.key === component)?.label ??
    component
  );
}

export function getAccessResourceLabel(resource?: AccessResource) {
  if (resource === "templates") return "تمپلیت";
  if (resource === "blocks") return "بلاک";
  if (resource === "pages") return "صفحه";
  return "این آیتم";
}
