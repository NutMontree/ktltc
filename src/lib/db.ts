import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const sanitizedUri = uri.replace(/\/\/.*@/, "//****:****@");
console.log(`🔌 [MongoDB] Target: ${sanitizedUri}`);

const options = {
  // Use defaults for now to isolate the hang issue
  connectTimeoutMS: 30000, // Increase timeout for slow connections
  serverSelectionTimeoutMS: 30000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

/**
 * ฟังก์ชันสำหรับสร้าง Index อัตโนมัติ
 * ช่วยแก้ปัญหา Performance (LCP/FCP) โดยเฉพาะการดึง Log และ Login
 */
async function createIndexes(promise: Promise<MongoClient>) {
  try {
    const client = await promise;
    const db = client.db("ktltc_db");

    // 1. Index สำหรับ Audit Log (เรียงลำดับเวลาล่าสุด)
    await db.collection("logs").createIndex({ timestamp: -1 });

    // 2. Index สำหรับ Users (ค้นหา username ได้รวดเร็วและห้ามซ้ำ)
    await db.collection("users").createIndex({ username: 1 }, { unique: true });

    // 3. Index สำหรับการจัดลำดับ User ในหน้า Dashboard
    await db.collection("users").createIndex({ orderIndex: 1 });

    // 4. Index สำหรับ Attendance (เพิ่มเข้ามาเพื่อความเร็วหน้า Data Management)
    await db.collection("attendances").createIndex({ date: -1 });
    await db.collection("attendances").createIndex({ userId: 1 });

    // 5. Index สำหรับ Leave Requests
    await db.collection("leave_requests").createIndex({ createdAt: -1 });
    await db.collection("leave_requests").createIndex({ userId: 1 });
    await db.collection("leave_requests").createIndex({ startDate: -1 });

    console.log("✅ [MongoDB] Indexes created/verified successfully");
  } catch (error) {
    console.error("❌ [MongoDB] Index creation error:", error);
  }
}

// ในทุกโหมด ใช้ global variable เพื่อป้องกันการสร้าง Connection ซ้ำซ้อน
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  console.log("🔌 [MongoDB] Initializing new connection...");
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect()
    .then((connectedClient) => {
      console.log("✅ [MongoDB] Connected successfully");
      return connectedClient;
    })
    .catch((err) => {
      console.error("❌ [MongoDB] Connection failed:", err);
      globalWithMongo._mongoClientPromise = undefined; // เคลียร์ออกเพื่อให้ลองใหม่ครั้งหน้า
      throw err;
    });
  
  // ⚡ สร้าง Index ใน background
  createIndexes(globalWithMongo._mongoClientPromise);
}

clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;
