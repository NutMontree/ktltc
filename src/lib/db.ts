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
  connectTimeoutMS: 30000,        // เพิ่มจาก 10s -> 30s: เผื่อเน็ต VPN สวิงหรือปิงขึ้นสูง
  serverSelectionTimeoutMS: 30000, // เพิ่มจาก 10s -> 30s: ให้โค้ดรอการเชื่อมต่อฐานข้อมูลนานขึ้น
  socketTimeoutMS: 45000,         // เพิ่มจาก 15s -> 45s: ถ้า query ค้างเกิน 45 วิ ถึงจะตัดจบ
  maxPoolSize: 200,               // ขยายให้รับ 200 connection ต่อ 1 PM2 Instance (รวม 3000 connections)
  minPoolSize: 5,                 // เลี้ยง connection ขั้นต่ำไว้ 5 เส้น (warm connection)
  heartbeatFrequencyMS: 10000,   // ตรวจสอบสุขภาพ connection ทุก 10 วิ
  retryWrites: true,              // retry อัตโนมัติเมื่อ write ล้มเหลว
  retryReads: true,               // retry อัตโนมัติเมื่อ read ล้มเหลว
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

    // 6. Index สำหรับ Election System
    await db.collection("elections").createIndex({ status: 1 });
    await db.collection("candidates").createIndex({ electionId: 1 });
    await db.collection("votes").createIndex({ electionId: 1, userId: 1 }, { unique: true });

    // 7. Index สำหรับ Real-time Visitors (TTL 60 seconds)
    await db.collection("visitors_live").createIndex({ lastActiveAt: 1 }, { expireAfterSeconds: 60 });

    // 8. Index สำหรับ Rate Limiting (TTL 15 minutes) - แก้ปัญหาเว็บค้างตอนคนล็อกอินพร้อมกันเยอะๆ
    await db.collection("login_attempts").createIndex({ timestamp: 1 }, { expireAfterSeconds: 900 });
    // เพิ่ม Index ค้นหา username + timestamp เพื่อความเร็วตอนนับจำนวนที่ผิด
    await db.collection("login_attempts").createIndex({ username: 1, timestamp: -1 });

    // 9. Index สำหรับระบบติดตามพิกัด GPS (Off Campus Sessions)
    // รองรับ Request 333+ ต่อวินาที เวลาเด็กเปิดหน้านี้ทิ้งไว้
    await db.collection("off_campus_sessions").createIndex({ studentId: 1, status: 1 });

    // 10. Index สำหรับระบบจัดการสิทธิ์ (Role Permissions)
    // รองรับการโหลดหน้า Dashboard ของเด็ก 5000 คน ไม่ให้ DB ทำ Full Scan
    await db.collection("role_permissions").createIndex({ role: 1 }, { unique: true });

    // 11. Index สำหรับระบบ Custom Menus
    await db.collection("custom_menus").createIndex({ workspace: 1 });

    // 12. Index สำหรับระบบเข้าแถวหน้าเสาธง (Flagpole)
    // รองรับเด็กนักเรียน 5,000 คน สแกนหน้าเช็คชื่อพร้อมกันตอน 07:50
    await db.collection("flagpole_attendances").createIndex({ userId: 1, date: -1 });
    await db.collection("flagpole_settings").createIndex({ key: 1 }, { unique: true });

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

