const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('ktltc_db');
  const classrooms = await db.collection('student_care_records').distinct('classroom');
  console.log(classrooms.sort());
  await client.close();
}
run();
