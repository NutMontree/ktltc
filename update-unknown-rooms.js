require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const collection = db.collection('student_care_records');
    
    const updates = [
      // Electric Power (ช่างไฟฟ้ากำลัง)
      { old: "ปวช.32", new: "ชฟ.32", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" },
      { old: "ปวช2", new: "ชฟ.21", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" }, // Or ชฟ.23, will notify user
      { old: "ปวส22", new: "สชฟ.22", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" },
      { old: "ปวส.22", new: "สชฟ.22", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" },
      { old: "ปวส 22", new: "สชฟ.22", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" },
      { old: "ปวส.1", new: "สชฟ.11", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" },
      { old: "ปวส11", new: "สชฟ.11", dept: "แผนกวิชาช่างไฟฟ้ากำลัง" },
      
      // Digital Business (เทคโนโลยีธุรกิจดิจิทัล)
      { old: "ปวส.2", new: "สบค.21", dept: "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล" },
      { old: "ปวส.21", new: "สบค.21", dept: "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล" },
      
      // Hotel (การโรงแรม)
      { old: "ปวส21", new: "สกร.21", dept: "แผนกวิชาการโรงแรม" }
    ];

    let totalUpdated = 0;
    for (const u of updates) {
      const result = await collection.updateMany(
        { classroom: u.old, department: { $regex: new RegExp(u.dept.replace("แผนกวิชา", ""), "i") } },
        { $set: { classroom: u.new } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Changed "${u.old}" to "${u.new}" (${result.modifiedCount} records)`);
        totalUpdated += result.modifiedCount;
      }
    }
    
    // Catch any leftovers that didn't match the department string perfectly
    const fallbackUpdates = [
      { old: "ปวช.32", new: "ชฟ.32" },
      { old: "ปวช2", new: "ชฟ.21" }, 
      { old: "ปวส22", new: "สชฟ.22" },
      { old: "ปวส.22", new: "สชฟ.22" },
      { old: "ปวส.1", new: "สชฟ.11" },
      { old: "ปวส11", new: "สชฟ.11" },
      { old: "ปวส.2", new: "สบค.21" },
      { old: "ปวส.21", new: "สบค.21" },
      { old: "ปวส21", new: "สกร.21" }
    ];

    for (const u of fallbackUpdates) {
      const result = await collection.updateMany(
        { classroom: u.old },
        { $set: { classroom: u.new } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Fallback] Changed "${u.old}" to "${u.new}" (${result.modifiedCount} records)`);
        totalUpdated += result.modifiedCount;
      }
    }
    
    console.log(`Done. Updated ${totalUpdated} records.`);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main();
