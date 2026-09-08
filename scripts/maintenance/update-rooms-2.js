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
      { old: "พค1.2", new: "พค.12" },
      { old: "พค32", new: "พค.32" },
      { old: "พต21", new: "พต.21" },
      { old: "มคก 11", new: "มคก.11" },
      { old: "มบค21", new: "มบค.21" },
      { old: "สชฟ.2", new: "สชฟ.21" }, // Assuming year 2 room 1
      { old: "สชฟ2", new: "สชฟ.21" },  // Assuming year 2 room 1
      { old: "สชฟ11", new: "สชฟ.11" },
      { old: "สชฟ22", new: "สชฟ.22" },
      { old: "สยธ", new: "สยธ.11" },   // Based on teacher's other rooms
      { old: "สยธ.", new: "สยธ.11" }   // Based on teacher's other rooms
    ];

    let totalUpdated = 0;
    for (const u of updates) {
      const result = await collection.updateMany(
        { classroom: u.old },
        { $set: { classroom: u.new } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Changed "${u.old}" to "${u.new}" (${result.modifiedCount} records)`);
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
