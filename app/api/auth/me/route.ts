import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";

// Returns the logged-in user + their fully resolved access map.
// Frontend fetches this once on login and caches it — no per-component access calls needed.
export const GET = compose(
    withDB(),
    withAuth({ allowUnverifiedPhone: false }),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;

    const access = await resolveUserAccess(String(user._id), user.permissions);

    // Serialize Sets to arrays for JSON
    const serialized = {
        components: Object.fromEntries(
            Object.entries(access.components).map(([k, v]) => [k, [...v]])
        ),
        templates: Object.fromEntries(
            Object.entries(access.templates).map(([k, v]) => [k, [...v]])
        ),
        blocks: Object.fromEntries(
            Object.entries(access.blocks).map(([k, v]) => [k, [...v]])
        ),
        pages: Object.fromEntries(
            Object.entries(access.pages).map(([k, v]) => [k, [...v]])
        ),
    };

    return NextResponse.json({ user, access: serialized });
});
