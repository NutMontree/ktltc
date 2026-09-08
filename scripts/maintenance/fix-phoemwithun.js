require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const collection = db.collection('student_care_records');
    
    // Find how many records match this criteria
    const matchQuery = { 
      teacherName: { $regex: /เพิ่มพิทูร สิมมา/ },
      classroom: "ปวช.24"
    };
    
    const count = await collection.countDocuments(matchQuery);
    console.log(`Found ${count} records for ปวช.24 by เพิ่มพิทูร สิมมา`);
    
    if (count > 0) {
      const result = await collection.updateMany(
        matchQuery,
        { $set: { classroom: "ชฟ.24" } }
      );
      console.log(`Updated ${result.modifiedCount} records to ชฟ.24`);
    }

    // Check for other "ปวช" classrooms by him
    const otherQuery = {
      teacherName: { $regex: /เพิ่มพิทูร สิมมา/ },
      classroom: { $regex: /^ปวช/ }
    };
    const others = await collection.distinct("classroom", otherQuery);
    if (others.length > 0) {
      console.log(`Note: This teacher also has these classrooms starting with ปวช:`, others);
    }

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main();
