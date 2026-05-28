const { MongoClient } = require('mongodb');
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

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in environment");
    return;
  }
  console.log("Connecting to URI:", uri);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    console.log("Connected to ktltc_db");
    
    // Find unique academicLevel values from users collection
    const uniqueLevels = await db.collection("users").distinct("academicLevel");
    console.log("Unique academicLevel values in users collection:", uniqueLevels);
    
    // Count users for each level
    for (const lvl of uniqueLevels) {
      const count = await db.collection("users").countDocuments({ academicLevel: lvl });
      console.log(`Level: "${lvl}" - count: ${count}`);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

check();
