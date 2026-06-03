import { NextRequest } from "next/server";
import { IUser } from "@/models/users";
import { IAgent } from "@/models/agent";

// Extend NextRequest to carry resolved context through the middleware chain
export interface AuthRequest extends NextRequest {
    ctx: {
        user?: IUser;
        agent?: IAgent;
    };
}
