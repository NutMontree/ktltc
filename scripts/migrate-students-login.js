const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Manually load .env file
function loadEnv() {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    console.log("Loading environment variables from .env...");
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  } else {
    console.warn(".env file not found at " + envPath);
  }
}

loadEnv();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined.");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    console.log("🔍 Finding students in the database...");
    const students = await db.collection("users").find({ role: "student" }).toArray();
    console.log(`Found ${students.length} student records.`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const student of students) {
      const citizenId = student.citizenId;
      const username = student.username;
      
      if (!citizenId) {
        console.warn(`⚠️ Skipped student "${student.name}" (ID: ${student._id}): No citizenId found.`);
        skippedCount++;
        continue;
      }
      
      const cleanCitizenId = citizenId.replace(/[^0-9]/g, "").trim();
      if (cleanCitizenId.length !== 13) {
        console.warn(`⚠️ Skipped student "${student.name}" (ID: ${student._id}): citizenId "${citizenId}" is invalid (must be 13 digits).`);
        skippedCount++;
        continue;
      }
      
      if (username === cleanCitizenId) {
        // Already migrated
        skippedCount++;
        continue;
      }
      
      // Update username to be citizenId
      await db.collection("users").updateOne(
        { _id: student._id },
        { $set: { username: cleanCitizenId, updatedAt: new Date() } }
      );
      console.log(`✅ Migrated student "${student.name}": "${username}" -> "${cleanCitizenId}"`);
      migratedCount++;
    }
    
    console.log(`\n🎉 Migration Complete:`);
    console.log(`- Total Students Examined: ${students.length}`);
    console.log(`- Total Successfully Migrated: ${migratedCount}`);
    console.log(`- Skipped / Already Migrated: ${skippedCount}`);
    
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
  } finally {
    await client.close();
  }
}

run();
