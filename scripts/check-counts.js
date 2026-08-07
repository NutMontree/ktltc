require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("No URI"); return; }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const count = await db.collection("users").countDocuments({ role: "student" });
    console.log("Students:", count);
    
    const attendances = await db.collection("flagpole_attendances").countDocuments();
    console.log("Attendances:", attendances);
    
    if (attendances > 0) {
       const sample = await db.collection("flagpole_attendances").find().sort({date:-1}).limit(1).toArray();
       console.log("Latest attendance date:", sample[0].date);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
check();
