const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("ktltc_db");
  const doc = await db.collection("dve_student_grades").findOne({});
  if (doc) {
    console.log("studentId type:", typeof doc.studentId, doc.studentId.constructor.name);
    console.log("subjectId type:", typeof doc.subjectId, doc.subjectId.constructor.name);
  } else {
    console.log("No docs found");
  }
  await client.close();
}

require('dotenv').config({ path: '/home/ktltc/ktltc/.env' });
main().catch(console.error);
