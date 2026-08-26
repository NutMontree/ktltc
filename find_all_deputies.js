const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('ktltc_db');
  const deputies = await db.collection('users').find({ position: /รองผู้อำนวย/i }).toArray();
  console.log('Deputies:', deputies.map(d => d.name + ' - ' + d.position));
  await client.close();
}
run().catch(console.error);
