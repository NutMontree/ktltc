import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    const quiz = await db.collection("dve_quizzes").findOne({
      _id: new pkg.ObjectId("6a151bf0249e1ad710c0a673")
    });
    
    console.log("Quiz details:");
    console.log(JSON.stringify(quiz, null, 2));
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await client.close();
  }
}

run();
