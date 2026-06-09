const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "ktltc_db";

async function createIndexes() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Indexes for users collection
    console.log("Creating indexes for users collection...");
    await db.collection("users").createIndex({ role: 1 });
    await db.collection("users").createIndex({ department: 1 });
    await db.collection("users").createIndex({ classGroupId: 1 });
    console.log("Users collection indexes created");

    // Indexes for dve_subjects collection
    console.log("Creating indexes for dve_subjects collection...");
    await db.collection("dve_subjects").createIndex({ teacherId: 1 });
    await db.collection("dve_subjects").createIndex({ department: 1 });
    console.log("DVE subjects collection indexes created");

    // Indexes for dve_units collection
    console.log("Creating indexes for dve_units collection...");
    await db.collection("dve_units").createIndex({ subjectId: 1 });
    await db.collection("dve_units").createIndex({ sequence: 1 });
    console.log("DVE units collection indexes created");

    // Indexes for dve_attendances collection
    console.log("Creating indexes for dve_attendances collection...");
    await db.collection("dve_attendances").createIndex({ subjectId: 1 });
    await db.collection("dve_attendances").createIndex({ studentId: 1 });
    await db.collection("dve_attendances").createIndex({ date: 1 });
    await db.collection("dve_attendances").createIndex({ classGroupId: 1 });
    await db.collection("dve_attendances").createIndex({ subjectId: 1, date: 1 });
    await db.collection("dve_attendances").createIndex({ studentId: 1, date: 1 });
    console.log("DVE attendances collection indexes created");

    // Indexes for dve_quizzes collection
    console.log("Creating indexes for dve_quizzes collection...");
    await db.collection("dve_quizzes").createIndex({ unitId: 1 });
    await db.collection("dve_quizzes").createIndex({ subjectId: 1 });
    await db.collection("dve_quizzes").createIndex({ startDate: 1 });
    console.log("DVE quizzes collection indexes created");

    console.log("All indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    await client.close();
  }
}

createIndexes();
