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
      teacherName: { $regex: /บุญจันทร์ โตมร/ },
      classroom: "ปวช.31"
    };
    
    const count = await collection.countDocuments(matchQuery);
    console.log(`Found ${count} records for ปวช.31 by บุญจันทร์ โตมร`);
    
    if (count > 0) {
      const result = await collection.updateMany(
        matchQuery,
        { $set: { classroom: "ชฟ.31" } }
      );
      console.log(`Updated ${result.modifiedCount} records to ชฟ.31`);
    }

    // Let's also check if there are other "ปวช" classrooms by him just to inform the user
    const otherQuery = {
      teacherName: { $regex: /บุญจันทร์ โตมร/ },
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
