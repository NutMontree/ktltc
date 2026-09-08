const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    const targetString = "แผนกวิชาการตลาด/โลจิสติก์";
    const replacementString = "แผนกวิชาการตลาด";
    
    let totalUpdated = 0;

    for (const collInfo of collections) {
      const collName = collInfo.name;
      const collection = db.collection(collName);
      
      // Update department fields
      const result1 = await collection.updateMany(
        { department: targetString },
        { $set: { department: replacementString } }
      );
      
      // Update role/positions fields if any
      const result2 = await collection.updateMany(
        { "student.department": targetString },
        { $set: { "student.department": replacementString } }
      );
      
      const result3 = await collection.updateMany(
        { teacherDepartment: targetString },
        { $set: { teacherDepartment: replacementString } }
      );
      
      const updated = result1.modifiedCount + result2.modifiedCount + result3.modifiedCount;
      if (updated > 0) {
        console.log(`Updated ${updated} documents in ${collName}`);
        totalUpdated += updated;
      }
    }
    
    console.log(`Migration completed. Total documents updated: ${totalUpdated}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
