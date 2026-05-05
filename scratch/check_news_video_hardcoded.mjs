import pkg from 'mongodb';
const { MongoClient } = pkg;

console.log("Script starting...");

const uri = "mongodb://admin:password1234@127.0.0.1:27017/ktltc_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  console.log("Connecting to MongoDB...");
  try {
    await client.connect();
    console.log("Connected!");
    const db = client.db("ktltc_db");
    const news = db.collection("news");
    
    const sample = await news.findOne({ images: { $regex: /\.(mp4|webm|mov|m4v)/i } });
    if (sample) {
      console.log("--- SAMPLE VIDEO NEWS ---");
      console.log(JSON.stringify(sample, null, 2));
    } else {
      console.log("No video news found.");
    }
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

run();
