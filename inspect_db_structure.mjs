import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const users = db.collection("users");
    
    const factions = await users.distinct("faction");
    const departments = await users.distinct("department");
    
    console.log("--- UNIQUE FACTIONS (DIVISIONS) ---");
    console.log(factions);
    
    console.log("\n--- UNIQUE DEPARTMENTS (JOBS) ---");
    console.log(departments);
    
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
