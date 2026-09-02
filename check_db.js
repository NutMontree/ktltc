const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('ktltc_db');
  const student = await db.collection('users').findOne({ studentIdNum: { $exists: true } });
  console.log(JSON.stringify(student, null, 2));
  await client.close();
}
run().catch(console.error);
