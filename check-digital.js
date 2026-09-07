require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const collection = db.collection('student_care_records');
    
    // Digital Business
    let docs = await collection.distinct("classroom", { department: "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล" });
    console.log("Digital Business:", docs.filter(d => !d.startsWith('6')));

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main();
