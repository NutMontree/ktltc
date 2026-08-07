const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    
    // Find recent records
    const records = await db.collection('student_care_records').find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log("Recent records:");
    records.forEach(r => {
      console.log(`- ID: ${r._id}, teacherName: ${r.teacherName}, teacherId: ${r.teacherId}, studentName: ${r.studentName}, createdAt: ${r.createdAt}`);
    });

  } finally {
    await client.close();
  }
}

main().catch(console.error);
