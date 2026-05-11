import { MongoClient } from "mongodb";

/**
 * db.ts: ไฟล์จัดการการเชื่อมต่อฐานข้อมูล MongoDB (Native Driver)
 * 
 * หน้าที่: 
 * 1. สร้าง Connection Pool ไปยัง MongoDB 
 * 2. ใช้ Pattern 'Global Variable' เพื่อป้องกันการสร้าง Connection ใหม่ทุกครั้งที่มีการ Request (ช่วยประหยัดทรัพยากร)
 * 3. จัดการสร้าง Index อัตโนมัติเพื่อเพิ่มความเร็วในการค้นหาข้อมูล (Performance Optimization)
 * 
 * ความเชื่อมโยง:
 * - ถูกเรียกใช้ในทุกๆ API Route ที่ต้องการดึงข้อมูลจากฐานข้อมูล
 */

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
// ทำการเซนเซอร์รหัสผ่านใน Log เพื่อความปลอดภัย
const sanitizedUri = uri.replace(/\/\/.*@/, "//****:****@");
console.log(`🔌 [MongoDB] Target: ${sanitizedUri}`);

const options = {
  connectTimeoutMS: 30000, // กำหนดเวลารอการเชื่อมต่อสูงสุด 30 วินาที
  serverSelectionTimeoutMS: 30000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

/**
 * ฟังก์ชันสำหรับสร้าง Index อัตโนมัติ (Database Indexing)
 * หน้าที่: เพิ่มความเร็วในการสืบค้นข้อมูลในคอลเลกชันต่างๆ 
 */
async function createIndexes(promise: Promise<MongoClient>) {
  try {
    const client = await promise;
    const db = client.db("ktltc_db");

    // 1. Index สำหรับ Audit Log: เรียงลำดับตามเวลาล่าสุด (-1 คือจากใหม่ไปเก่า)
    await db.collection("logs").createIndex({ timestamp: -1 });

    // 2. Index สำหรับ Users: ค้นหา username ได้รวดเร็วและห้ามซ้ำ (unique)
    await db.collection("users").createIndex({ username: 1 }, { unique: true });

    // 3. Index สำหรับการจัดลำดับ User: ใช้ในหน้าบุคลากร
    await db.collection("users").createIndex({ orderIndex: 1 });

    // 4. Index สำหรับ Attendance: ค้นหาข้อมูลการลงเวลาได้เร็วขึ้น
    await db.collection("attendances").createIndex({ date: -1 });
    await db.collection("attendances").createIndex({ userId: 1 });

    // 5. Index สำหรับ Leave Requests: ค้นหาประวัติการลา
    await db.collection("leave_requests").createIndex({ createdAt: -1 });
    await db.collection("leave_requests").createIndex({ userId: 1 });
    await db.collection("leave_requests").createIndex({ startDate: -1 });

    console.log("✅ [MongoDB] Indexes created/verified successfully");
  } catch (error) {
    console.error("❌ [MongoDB] Index creation error:", error);
  }
}

// การจัดการ Singleton Connection (เพื่อให้มี Connection เดียวทั้งแอป)
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
      globalWithMongo._mongoClientPromise = undefined; // รีเซ็ตเพื่อให้ลองเชื่อมต่อใหม่ได้
      throw err;
    });
  
  // รันการสร้าง Index ในพื้นหลัง (Background) ไม่ต้องรอให้เสร็จก่อนเริ่มแอป
  createIndexes(globalWithMongo._mongoClientPromise);
}

clientPromise = globalWithMongo._mongoClientPromise;

// ส่งออก clientPromise เพื่อให้ไฟล์อื่นนำไปใช้ (เช่น await clientPromise)
export default clientPromise;

