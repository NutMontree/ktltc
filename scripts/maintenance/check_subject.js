const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("ktltc_db");
  
  const subject = await db.collection("dve_subjects").findOne({ code: "31910-2023" });
  if (!subject) {
    console.log("Subject not found");
    return;
  }
  console.log("Subject:", subject.code, subject.name);
  console.log("allowedClassGroups:", subject.allowedClassGroups);
  
  await client.close();
}

require('dotenv').config({ path: '/home/ktltc/ktltc/.env' });
main().catch(console.error);
