require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const collection = db.collection('student_care_records');
    
    const uniqueClassrooms = await collection.distinct("classroom");
    console.log("Found classrooms:", uniqueClassrooms);
    
    let updated = 0;
    
    for (const c of uniqueClassrooms) {
      if (!c) continue;
      
      let newClassroom = c.trim();
      
      // Remove specific suffixes
      newClassroom = newClassroom.replace(/\s*\(ทวิภาคี\)\s*/g, '');
      newClassroom = newClassroom.replace(/\s*\(ทวิวุฒิ\)\s*/g, '');
      newClassroom = newClassroom.replace(/\s*\(?ทวิฯ\)?\s*/g, '');
      
      // Remove '/' 
      newClassroom = newClassroom.replace(/\//g, '');
      
      // Clean up extra spaces
      newClassroom = newClassroom.trim();

      if (c !== newClassroom) {
        const result = await collection.updateMany(
          { classroom: c },
          { $set: { classroom: newClassroom } }
        );
        updated += result.modifiedCount;
        console.log(`Changed "${c}" to "${newClassroom}" (${result.modifiedCount} records)`);
      }
    }
    
    console.log(`Done. Updated ${updated} records.`);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main();
