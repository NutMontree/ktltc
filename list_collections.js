const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('ktltc_db');
  
  const collections = await db.listCollections().toArray();
  for (const collInfo of collections) {
    const count = await db.collection(collInfo.name).countDocuments();
    console.log(`- ${collInfo.name}: ${count} documents`);
  }
  
  await client.close();
}
run().catch(console.error);
