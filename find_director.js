const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('ktltc_db');
  const director = await db.collection('users').findOne({ $or: [{ position: /ผู้อำนวยการ/i }, { role: 'director' }] });
  console.log('Director:', director ? director.name : 'Not found');
  await client.close();
}
run().catch(console.error);
