import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const news = db.collection("news");
    
    const sample = await news.findOne({ images: { $regex: /\.(mp4|webm|mov|m4v)/i } });
    console.log("--- SAMPLE VIDEO NEWS ---");
    console.log(JSON.stringify(sample, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
