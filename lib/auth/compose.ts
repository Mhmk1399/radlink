import { NextRequest, NextResponse } from "next/server";
import { AuthRequest } from "@/lib/auth/types";
import { enforceRequestAccess } from "@/lib/auth/enforceAccess";

type Middleware = (
    req: AuthRequest,
    next: () => Promise<NextResponse>
) => Promise<NextResponse>;

// Chains middlewares left-to-right, each must call next() to continue.
// The last item in the array is the actual route handler.
//
// Usage:
//   export const GET = compose(withDB(), withAuth(), withRole("admin"))(async (req) => {
//       return NextResponse.json({ user: req.ctx.user });
//   });
export function compose(...middlewares: Middleware[]) {
    return <RouteCtx = unknown>(
        handler: (req: AuthRequest, ctx: RouteCtx) => Promise<NextResponse>
    ) =>
        async (req: NextRequest, routeCtx?: RouteCtx): Promise<NextResponse> => {
            const authReq = req as AuthRequest;
            if (!authReq.ctx) authReq.ctx = {};

            let index = 0;

            const run = async (): Promise<NextResponse> => {
                if (index < middlewares.length) {
                    const mw = middlewares[index++];
                    return mw(authReq, run);
                }
                const accessError = await enforceRequestAccess(authReq);
                if (accessError) return accessError;
                return handler(authReq, routeCtx as RouteCtx);
            };

            return run();
        };
}
