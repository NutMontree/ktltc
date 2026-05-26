import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    // Find submissions for student name containing 'ปิยวัฒน์'
    const submissions = await db.collection("dve_quiz_submissions").find({
      studentName: { $regex: 'ปิยวัฒน์' }
    }).toArray();
    
    console.log("Submissions found:", submissions.length);
    console.log(JSON.stringify(submissions, null, 2));

    // Find attendance records for the student
    if (submissions.length > 0) {
      const studentId = submissions[0].studentId;
      console.log("Student ID:", studentId);
      const attendances = await db.collection("dve_attendances").find({
        studentId: studentId
      }).toArray();
      console.log("Attendances found:", attendances.length);
      console.log(JSON.stringify(attendances, null, 2));
    }
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await client.close();
  }
}

run();
