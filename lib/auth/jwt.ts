import jwt from "jsonwebtoken";
import { IUser } from "@/models/users";

const SECRET = process.env.JWT_SECRET as string;
if (!SECRET) throw new Error("JWT_SECRET is not defined");

export type JwtPayload = {
    userId: string;
    role: IUser["role"];
    status: IUser["status"];
    firstName:string;
    lastName:string;
    phoneNumber:string;
};

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, SECRET) as JwtPayload;
}
