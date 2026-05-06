import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
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

    console.log("Cleaning existing roles...");
    // Keep super_admin and admin if they exist, or just insert everything
    for (const roleData of DEFAULT_ROLES) {
      await collection.updateOne(
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
    }

    console.log("Database seeded successfully!");
  } finally {
    await client.close();
  }
}

seed().catch(console.dir);
