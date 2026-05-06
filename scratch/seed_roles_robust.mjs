import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

// Function to load .env manually if dotenv is not available
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach(line => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    });
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI not found in environment");
  process.exit(1);
}

const client = new MongoClient(uri);

const DEFAULT_ROLES = [
  { role: "hr", label: "ฝ่ายบุคคล", permissions: { access_dashboard: true, manage_users: false, manage_news: false, manage_attendance: true, manage_system: false, manage_qa: false, manage_pages: false } },
  { role: "director", label: "ผู้อำนวยการ", permissions: { access_dashboard: true, manage_users: false, manage_news: false, manage_attendance: true, manage_system: false, manage_qa: false, manage_pages: false } },
  { role: "deputy_resource", label: "รอง ผอ. (บริหารทรัพยากร)", permissions: { access_dashboard: true, manage_users: false, manage_news: false, manage_attendance: true, manage_system: false, manage_qa: false, manage_pages: false } },
  { role: "deputy_strategy", label: "รอง ผอ. (ยุทธศาสตร์)", permissions: { access_dashboard: true, manage_users: false, manage_news: false, manage_attendance: true, manage_system: false, manage_qa: false, manage_pages: false } },
  { role: "deputy_academic", label: "รอง ผอ. (วิชาการ)", permissions: { access_dashboard: true, manage_users: false, manage_news: false, manage_attendance: true, manage_system: false, manage_qa: false, manage_pages: false } },
  { role: "deputy_student_affairs", label: "รอง ผอ. (กิจการนักเรียน)", permissions: { access_dashboard: true, manage_users: false, manage_news: false, manage_attendance: true, manage_system: false, manage_qa: false, manage_pages: false } },
  { role: "teacher", label: "ครู", permissions: { access_dashboard: false, manage_users: false, manage_news: false, manage_attendance: false, manage_system: false, manage_qa: false, manage_pages: true } },
  { role: "janitor", label: "แม่บ้าน/นักการ", permissions: { access_dashboard: false, manage_users: false, manage_news: false, manage_attendance: false, manage_system: false, manage_qa: false, manage_pages: true } },
  { role: "staff", label: "เจ้าหน้าที่", permissions: { access_dashboard: false, manage_users: false, manage_news: false, manage_attendance: false, manage_system: false, manage_qa: false, manage_pages: true } },
  { role: "student", label: "นักเรียน", permissions: { access_dashboard: false, manage_users: false, manage_news: false, manage_attendance: false, manage_system: false, manage_qa: false, manage_pages: true } },
  { role: "user", label: "สมาชิกทั่วไป", permissions: { access_dashboard: false, manage_users: false, manage_news: false, manage_attendance: false, manage_system: false, manage_qa: false, manage_pages: false } }
];

async function seed() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const collection = db.collection("role_permissions");

    console.log("🚀 [Seeder] Starting database seeding...");
    
    for (const roleData of DEFAULT_ROLES) {
      const result = await collection.updateOne(
        { role: roleData.role },
        { 
          $set: { 
            label: roleData.label,
            permissions: roleData.permissions,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
      console.log(`✅ [Seeder] Upserted role: ${roleData.role} (${roleData.label})`);
    }

    console.log("✨ [Seeder] All roles have been seeded/updated successfully!");
  } catch (error) {
    console.error("❌ [Seeder] Error seeding roles:", error);
  } finally {
    await client.close();
  }
}

seed();
