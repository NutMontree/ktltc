const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "ktltc";

async function fixUnitTimeValues() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const unitsCollection = db.collection("dve_units");

    // Find all units with string studyMinutes or totalMinutes
    const units = await unitsCollection.find({}).toArray();
    console.log(`Found ${units.length} units`);

    let updatedCount = 0;

    for (const unit of units) {
      const updates = {};
      let needsUpdate = false;

      // Convert studyMinutes from string to number
      if (typeof unit.studyMinutes === "string") {
        const numValue = Number(unit.studyMinutes);
        if (!isNaN(numValue)) {
          updates.studyMinutes = numValue;
          needsUpdate = true;
          console.log(`Unit ${unit._id}: studyMinutes "${unit.studyMinutes}" -> ${numValue}`);
        }
      }

      // Convert totalMinutes from string to number
      if (typeof unit.totalMinutes === "string") {
        const numValue = Number(unit.totalMinutes);
        if (!isNaN(numValue)) {
          updates.totalMinutes = numValue;
          needsUpdate = true;
          console.log(`Unit ${unit._id}: totalMinutes "${unit.totalMinutes}" -> ${numValue}`);
        }
      }

      if (needsUpdate) {
        await unitsCollection.updateOne(
          { _id: unit._id },
          { $set: updates }
        );
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} units`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

fixUnitTimeValues();
