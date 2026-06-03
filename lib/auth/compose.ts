import { NextRequest, NextResponse } from "next/server";
import { AuthRequest } from "@/lib/auth/types";

type Middleware = (
    req: AuthRequest,
    next: () => Promise<NextResponse>
) => Promise<NextResponse>;

// ctx is Next.js route context e.g. { params: Promise<{ id: string }> }
type Handler = (req: AuthRequest, ctx?: unknown) => Promise<NextResponse>;

// Chains middlewares left-to-right, each must call next() to continue.
// The last item in the array is the actual route handler.
//
// Usage:
//   export const GET = compose(withDB(), withAuth(), withRole("admin"))(async (req) => {
//       return NextResponse.json({ user: req.ctx.user });
//   });
export function compose(...middlewares: Middleware[]) {
    return (handler: Handler) =>
        async (req: NextRequest, routeCtx?: unknown): Promise<NextResponse> => {
            const authReq = req as AuthRequest;
            if (!authReq.ctx) authReq.ctx = {};

            let index = 0;

            const run = async (): Promise<NextResponse> => {
                if (index < middlewares.length) {
                    const mw = middlewares[index++];
                    return mw(authReq, run);
                }
                return handler(authReq, routeCtx);
            };

            return run();
        };
}
