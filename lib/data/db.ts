import { Resolver } from "node:dns/promises";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DNS_SERVERS = process.env.MONGODB_DNS_SERVERS
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

async function resolveMongoUri(uri: string) {
    if (!MONGODB_DNS_SERVERS?.length || !uri.startsWith("mongodb+srv://")) {
        return uri;
    }

    const parsedUri = new URL(uri);
    const resolver = new Resolver();
    resolver.setServers(MONGODB_DNS_SERVERS);

    const [srvRecords, txtRecords] = await Promise.all([
        resolver.resolveSrv(`_mongodb._tcp.${parsedUri.hostname}`),
        resolver.resolveTxt(parsedUri.hostname).catch(() => []),
    ]);

    const hosts = srvRecords
        .map(({ name, port }) => `${name.replace(/\.$/, "")}:${port}`)
        .join(",");

    for (const [key, value] of new URLSearchParams(txtRecords.flat().join(""))) {
        if (!parsedUri.searchParams.has(key)) {
            parsedUri.searchParams.set(key, value);
        }
    }

    if (!parsedUri.searchParams.has("tls")) {
        parsedUri.searchParams.set("tls", "true");
    }

    const credentials = parsedUri.username
        ? `${parsedUri.username}${parsedUri.password ? `:${parsedUri.password}` : ""}@`
        : "";
    const search = parsedUri.searchParams.toString();

    return `mongodb://${credentials}${hosts}${parsedUri.pathname}${search ? `?${search}` : ""}`;
}

// Cache connection across hot reloads in dev
const globalWithMongoose = global as typeof globalThis & {
    _mongooseConn?: typeof mongoose;
};

export async function connectDB() {
    if (globalWithMongoose._mongooseConn) return globalWithMongoose._mongooseConn;
    const resolvedUri = await resolveMongoUri(MONGODB_URI);
    await mongoose.connect(resolvedUri);
    globalWithMongoose._mongooseConn = mongoose;
    return mongoose;
}
