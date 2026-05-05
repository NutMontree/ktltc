const { MongoClient } = require('mongodb');
require('dotenv').config();

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in environment");
    return;
  }
  
  const client = new MongoClient(uri);
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    const db = client.db("ktltc_db");
    console.log("Connected to ktltc_db");
    
    const userCount = await db.collection("users").countDocuments();
    console.log(`Total users: ${userCount}`);
    
    const inactiveUsers = await db.collection("users").countDocuments({ isActive: false });
    console.log(`Inactive users: ${inactiveUsers}`);
    
    const superAdmin = await db.collection("users").findOne({ role: "super_admin" });
    if (superAdmin) {
      console.log(`Super Admin found: ${superAdmin.username}, isActive: ${superAdmin.isActive}`);
    } else {
      console.log("No super_admin found!");
    }
    
    // Check if there are any sessions or oddities
    const logsCount = await db.collection("logs").countDocuments({ timestamp: { $gt: new Date(Date.now() - 3600000) } });
    console.log(`Logs in the last hour: ${logsCount}`);

  } catch (e) {
    console.error("Database connection error:", e.message);
  } finally {
    await client.close();
  }
}

check();
