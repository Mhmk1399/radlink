import jwt from "jsonwebtoken";
import type { IUser } from "@/models/users";

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("کلید امضای توکن تنظیم نشده است.");
    return secret;
}

export type JwtPayload = {
    userId: string;
    role: IUser["role"];
    status: IUser["status"];
    firstName:string;
    lastName:string;
    phoneNumber:string;
};

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
