const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("ktltc_db");
  
  // Find a subject and student
  const grade = await db.collection("dve_student_grades").findOne({});
  if (!grade) {
    console.log("No grades found");
    return;
  }
  
  console.log("Before:", grade.sequence);
  
  // Simulate API update
  const updateData = {
    updatedAt: new Date()
  };
  updateData.sequence = 999;
  
  await db.collection("dve_student_grades").updateOne(
    { subjectId: grade.subjectId, studentId: grade.studentId },
    { $set: updateData }
  );
  
  const after = await db.collection("dve_student_grades").findOne({ _id: grade._id });
  console.log("After:", after.sequence);
  
  await client.close();
}

require('dotenv').config({ path: '/home/ktltc/ktltc/.env' });
main().catch(console.error);
