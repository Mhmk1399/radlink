import { NextResponse } from "next/server";
import { connectDB } from "@/lib/data/db";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthRequest } from "@/lib/auth/types";
import User, { UserRole, UserStatus } from "@/models/users";
import Agent from "@/models/agent";
import { AccessAction } from "@/models/access";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import {
    AUTH_MESSAGES,
    evaluateRequestAccess,
    forbiddenAccessResponse,
    unauthorizedResponse,
} from "@/lib/auth/enforceAccess";

type Middleware = (
    req: AuthRequest,
    next: () => Promise<NextResponse>
) => Promise<NextResponse>;

// ─── withDB ──────────────────────────────────────────────────────────────────
// Ensures MongoDB is connected before proceeding.
export function withDB(): Middleware {
    return async (req, next) => {
        await connectDB();
        return next();
    };
}

// ─── withAuth ────────────────────────────────────────────────────────────────
// Verifies JWT from Authorization header and attaches user to req.ctx.
// Options:
//   allowUnverifiedPhone — allow users that haven't verified phone yet (default false)
export function withAuth(options?: { allowUnverifiedPhone?: boolean }): Middleware {
    return async (req, next) => {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return unauthorizedResponse();

        try {
            const payload = verifyToken(token);
            const user = await User.findById(payload.userId);

            if (!user) return NextResponse.json({ code: "USER_NOT_FOUND", message: AUTH_MESSAGES.userNotFound }, { status: 401 });

            if (!options?.allowUnverifiedPhone && !user.isPhoneVerified) {
                return NextResponse.json({ code: "PHONE_NOT_VERIFIED", message: AUTH_MESSAGES.phoneNotVerified }, { status: 403 });
            }

            req.ctx = { ...req.ctx, user };
            return next();
        } catch {
            return NextResponse.json({ code: "INVALID_TOKEN", message: AUTH_MESSAGES.invalidToken }, { status: 401 });
        }
    };
}

// ─── withRole ────────────────────────────────────────────────────────────────
// Restricts access to specific roles.
// Usage: withRole("admin", "superAdmin")
export function withRole(...roles: UserRole[]): Middleware {
    return async (req, next) => {
        const user = req.ctx?.user;
        if (!user || !roles.includes(user.role)) {
            const evaluated = await evaluateRequestAccess(req);
            if (evaluated.matched && evaluated.granted) return next();
            if (evaluated.matched) return forbiddenAccessResponse(evaluated.target ?? undefined);

            return NextResponse.json({ code: "INSUFFICIENT_ROLE", message: AUTH_MESSAGES.insufficientRole }, { status: 403 });
        }
        return next();
    };
}

// ─── withStatus ──────────────────────────────────────────────────────────────
// Restricts access to users with specific statuses.
// Usage: withStatus("active")
export function withStatus(...statuses: UserStatus[]): Middleware {
    return async (req, next) => {
        const user = req.ctx?.user;
        if (!user || !statuses.includes(user.status)) {
            return NextResponse.json({ code: "ACCOUNT_STATUS_NOT_ALLOWED", message: AUTH_MESSAGES.accountStatusNotAllowed }, { status: 403 });
        }
        return next();
    };
}

// ─── withAgent ───────────────────────────────────────────────────────────────
// Loads the Agent record for the authenticated user and attaches to req.ctx.
// Requires withAuth to have run first.
// Options:
//   requireActive — reject if agent.isActive is false (default true)
export function withAgent(options?: { requireActive?: boolean }): Middleware {
    return async (req, next) => {
        const user = req.ctx?.user;
        if (!user) return unauthorizedResponse();

        const agent = await Agent.findOne({ user: user._id });
        if (!agent) return NextResponse.json({ code: "AGENT_NOT_FOUND", message: AUTH_MESSAGES.agentNotFound }, { status: 404 });

        const requireActive = options?.requireActive ?? true;
        if (requireActive && !agent.isActive) {
            return NextResponse.json({ code: "AGENT_INACTIVE", message: AUTH_MESSAGES.agentInactive }, { status: 403 });
        }

        req.ctx = { ...req.ctx, agent };
        return next();
    };
}

// ─── withPermission ──────────────────────────────────────────────────────────
// Checks that the user has a specific action on a static component OR a dynamic
// object (template / block / page by ID).
//
// Static usage:   withPermission({ component: "dashboard.reports", action: "view" })
// Dynamic usage:  withPermission({ resource: "templates", resourceId: "...", action: "update" })
//
// superAdmin bypasses all permission checks.
type PermissionOptions =
    | { component: string; action: AccessAction }
    | { resource: "templates" | "blocks" | "pages"; resourceId: string; action: AccessAction };

export function withPermission(options: PermissionOptions): Middleware {
    return async (req, next) => {
        const user = req.ctx?.user;
        if (!user) return unauthorizedResponse();

        // superAdmin bypasses everything.
        if (user.role === "superAdmin") return next();

        // Single cached aggregation — no multi-query chain
        const resolved = await resolveUserAccess(String(user._id), user.permissions);

        let granted = false;

        if ("component" in options) {
            granted = resolved.components[options.component]?.has(options.action) ?? false;
        } else {
            const { resource, resourceId, action } = options;
            granted = resolved[resource][resourceId]?.has(action) ?? false;
        }

        if (!granted) {
            return forbiddenAccessResponse(
                "component" in options
                    ? { component: options.component, action: options.action }
                    : {
                        resource: options.resource,
                        resourceId: options.resourceId,
                        action: options.action,
                    },
            );
        }

        return next();
    };
}
