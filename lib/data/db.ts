import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

// Cache connection across hot reloads in dev
const globalWithMongoose = global as typeof globalThis & {
    _mongooseConn?: typeof mongoose;
};

export async function connectDB() {
    if (globalWithMongoose._mongooseConn) return globalWithMongoose._mongooseConn;
    await mongoose.connect(MONGODB_URI);
    globalWithMongoose._mongooseConn = mongoose;
    return mongoose;
}
