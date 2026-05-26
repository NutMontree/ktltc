import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    console.log("=== ALL DVE SUBJECTS ===");
    const subjects = await db.collection("dve_subjects").find({}).toArray();
    subjects.forEach(s => {
      console.log(`ID: ${s._id}, Code: ${s.code}, Name: ${s.name}, Dept: ${s.department}, Teacher: ${s.teacherName}`);
    });

    console.log("\n=== ALL DVE UNITS ===");
    const units = await db.collection("dve_units").find({}).toArray();
    units.forEach(u => {
      console.log(`ID: ${u._id}, Seq: ${u.sequence}, Title: ${u.title}, SubjectId: ${u.subjectId}`);
    });

    console.log("\n=== ALL DVE ATTENDANCES ===");
    const attendances = await db.collection("dve_attendances").find({}).toArray();
    attendances.forEach(a => {
      console.log(`ID: ${a._id}, Student: ${a.studentName}, IdNum: ${a.studentIdNum}, Status: ${a.status}, Date: ${a.date}, Score: ${a.score}, UnitId: ${a.unitId}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
