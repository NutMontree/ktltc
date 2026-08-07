const { MongoClient } = require('mongodb');
const fs = require('fs');

function parseEnv() {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
  });
  return env;
}

async function check() {
  const env = parseEnv();
  const uri = env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const count = await db.collection("flagpole_attendances").countDocuments();
    console.log("Total flagpole_attendances:", count);
    const students = await db.collection("users").countDocuments({ role: "student", isActive: { $ne: false } });
    console.log("Total active students:", students);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
check();
