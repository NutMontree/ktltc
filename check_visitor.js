const { MongoClient } = require("mongodb");

async function run() {
  const uri = "mongodb://192.168.6.118:27017/ktltc_db?authSource=admin";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const result = await db.collection("site_stats").findOne({ _id: "visitor_count" });
    console.log("Visitor stats document:", result);
    console.log("Type of result.count:", typeof result?.count);
    if (result && result.count) {
      console.log("String representation:", String(result.count));
      console.log("Length:", String(result.count).length);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
