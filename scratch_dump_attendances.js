import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    console.log("=== FULL DVE ATTENDANCES DETAILS ===");
    const attendances = await db.collection("dve_attendances").find({}).toArray();
    console.log(JSON.stringify(attendances, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
