const { MongoClient } = require("mongodb");

async function run() {
  // Use the URI from .env if possible, otherwise use the one we found
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env file");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");

    console.log("Ensuring indexes for ktltc_db...");

    // Attendances
    console.log("- Checking attendances...");
    await db.collection("attendances").createIndex({ date: -1 });
    await db.collection("attendances").createIndex({ userId: 1 });

    // Leave Requests
    console.log("- Checking leave_requests...");
    await db.collection("leave_requests").createIndex({ createdAt: -1 });
    await db.collection("leave_requests").createIndex({ userId: 1 });
    await db.collection("leave_requests").createIndex({ startDate: -1 });

    // Users (already has _id index, but role is useful for other admin queries)
    console.log("- Checking users...");
    await db.collection("users").createIndex({ role: 1 });
    await db.collection("users").createIndex({ username: 1 });

    // Login Attempts
    console.log("- Checking login_attempts...");
    // สร้าง TTL Index เพื่อให้ MongoDB ลบข้อมูลอัตโนมัติหลังจากผ่านไป 15 นาที (900 วินาที)
    await db.collection("login_attempts").createIndex({ timestamp: 1 }, { expireAfterSeconds: 900 });
    await db.collection("login_attempts").createIndex({ username: 1 });

    console.log("Success: All essential indexes ensured.");
  } catch (e) {
    console.error("Error creating indexes:", e);
  } finally {
    await client.close();
  }
}
run();
