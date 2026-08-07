const { MongoClient } = require('mongodb');

async function check() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const count = await db.collection("flagpole_attendances").countDocuments();
    console.log("Total flagpole_attendances:", count);
    const sample = await db.collection("flagpole_attendances").find().sort({date:-1}).limit(1).toArray();
    console.log("Latest attendance:", sample.map(s => s.date));
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
check();
