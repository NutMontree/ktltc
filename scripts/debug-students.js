const fs = require('fs');
const { MongoClient } = require('mongodb');

async function debugStudents() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/MONGODB_URI=(.*)/);
  if (!match) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }
  const uri = match[1].trim();
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    const students = await db.collection("users").find({ role: "student" }).toArray();
    console.log(`Total students in DB: ${students.length}`);
    
    const departmentsCount = {};
    students.forEach(s => {
      const dept = s.department || "undefined";
      departmentsCount[dept] = (departmentsCount[dept] || 0) + 1;
    });
    
    console.log("Departments distribution of registered students:");
    console.log(JSON.stringify(departmentsCount, null, 2));

    if (students.length > 0) {
      console.log("\nSample students:");
      students.slice(0, 10).forEach(s => {
        console.log(`- Name: ${s.name}, Dept: ${s.department}, ClassGroup: ${s.classGroupId}, citizenId: ${s.citizenId}`);
      });
    }

  } catch (error) {
    console.error("Error debugging students:", error);
  } finally {
    await client.close();
  }
}

debugStudents();
