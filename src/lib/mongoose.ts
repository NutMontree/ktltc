import mongoose from "mongoose";

/**
 * mongoose.ts: Centralized Mongoose connection manager
 * 
 * Uses the global caching pattern to prevent multiple connection pools in Next.js development 
 * and PM2 cluster mode.
 */

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      directConnection: true,  // ★ บังคับต่อตรง 127.0.0.1 ไม่ให้ driver ค้นหา IP อื่น
      bufferCommands: true,
      maxPoolSize: 50,         // 50 ต่อ instance x 4 = 200 รวม
    };

    console.log("🔌 [Mongoose] Initializing unified connection...");
    
    // MONGODB_URI might contain credentials, so we sanitize it for the log
    const sanitizedUri = MONGODB_URI.replace(/\/\/.*@/, "//****:****@");
    console.log(`🔌 [Mongoose] Target: ${sanitizedUri}`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ [Mongoose] Connected successfully");
      return mongoose;
    }).catch((err) => {
      console.error("❌ [Mongoose] Connection failed:", err);
      cached.promise = null; // allow retries
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
