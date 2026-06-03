import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";
import { AuthRequest } from "@/lib/auth/types";
import User, { UserRole, UserStatus } from "@/models/users";
import Agent from "@/models/agent";
import { AccessAction } from "@/models/access";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";

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
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        try {
            const payload = verifyToken(token);
            const user = await User.findById(payload.userId).lean<typeof User>();

            if (!user) return NextResponse.json({ message: "User not found" }, { status: 401 });

            if (!options?.allowUnverifiedPhone && !user.isPhoneVerified) {
                return NextResponse.json({ message: "Phone not verified" }, { status: 403 });
            }

            req.ctx = { ...req.ctx, user };
            return next();
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
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
            return NextResponse.json({ message: "Forbidden: insufficient role" }, { status: 403 });
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
            return NextResponse.json({ message: "Forbidden: account status not allowed" }, { status: 403 });
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
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const agent = await Agent.findOne({ user: user._id }).lean<typeof Agent>();
        if (!agent) return NextResponse.json({ message: "Agent profile not found" }, { status: 404 });

        const requireActive = options?.requireActive ?? true;
        if (requireActive && !agent.isActive) {
            return NextResponse.json({ message: "Agent account is inactive" }, { status: 403 });
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
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // superAdmin bypasses everything
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
            return NextResponse.json({ message: "Forbidden: access denied" }, { status: 403 });
        }

        return next();
    };
}
