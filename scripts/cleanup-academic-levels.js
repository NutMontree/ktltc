const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          const val = trimmed.substring(index + 1).trim();
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

function normalizeLevel(level) {
  if (!level) return "";
  let clean = level.toString().trim();
  
  // Normalize dotted formats e.g. ปวช. 1 -> ปวช 1
  clean = clean.replace(/ปวช\.\s*/g, "ปวช ");
  clean = clean.replace(/ปวส\.\s*/g, "ปวส ");
  
  // Normalize verbose formats like ปวส. ปีที่ 1 or ปวส ปีที่ 1 -> ปวส 1
  clean = clean.replace(/ปีที่\s*/g, "");
  
  // Clean double spaces
  clean = clean.replace(/\s+/g, " ").trim();
  
  return clean;
}

async function cleanup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in environment");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    console.log("Connected to ktltc_db");

    const users = await db.collection("users").find({}).toArray();
    console.log(`Scanning ${users.length} users...`);

    const validLevels = ["ปวช 1", "ปวช 2", "ปวช 3", "ปวส 1", "ปวส 2"];
    let updatedCount = 0;

    for (const user of users) {
      const origLevel = user.academicLevel;
      if (origLevel === undefined) continue;

      const normLevel = normalizeLevel(origLevel);
      let targetLevel = normLevel;

      // If level is not in our 5 allowed values, clear it
      if (origLevel && !validLevels.includes(normLevel)) {
        console.log(`User "${user.name}" (@${user.username}) has invalid level: "${origLevel}". Clearing it.`);
        targetLevel = "";
      }

      // If the value changed, update it in database
      if (origLevel !== targetLevel) {
        console.log(`Updating "${user.name}" (@${user.username}): "${origLevel}" -> "${targetLevel}"`);
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { academicLevel: targetLevel } }
        );
        updatedCount++;
      }
    }

    console.log(`Database cleanup completed. Total users updated: ${updatedCount}`);

  } catch (e) {
    console.error("Cleanup failed:", e);
  } finally {
    await client.close();
  }
}

cleanup();
