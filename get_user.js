const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ktltc_db"; 
  console.log("Connecting with URI:", uri);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const user = await db.collection("users").findOne({ _id: new ObjectId("6a12f1c07b06333d7f923c3d") });
    console.log("USER DETAILS:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.close();
  }
}

run();
