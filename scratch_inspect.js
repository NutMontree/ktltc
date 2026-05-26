import pkg from 'mongodb';
const { MongoClient } = pkg;

const uris = [
  "mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin",
  "mongodb://nut:Nut29122539@192.168.6.179:27017/ktltc_db?authSource=admin",
  "mongodb://127.0.0.1:27017/ktltc_db",
  "mongodb://127.0.0.1:27017"
];

async function tryConnect(uri) {
  console.log("Trying to connect to:", uri.replace(/:([^:@]+)@/, ":xxxx@"));
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
  try {
    await client.connect();
    console.log("SUCCESS connected to:", uri.replace(/:([^:@]+)@/, ":xxxx@"));
    const db = client.db("ktltc_db");
    
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    const subject = await db.collection("dve_subjects").findOne({});
    console.log("Sample DVE Subject:", JSON.stringify(subject, null, 2));

    const unit = await db.collection("dve_units").findOne({});
    console.log("Sample DVE Unit:", JSON.stringify(unit, null, 2));

    const user = await db.collection("users").findOne({ role: "student" });
    console.log("Sample Student User:", JSON.stringify(user, null, 2));

    await client.close();
    return true;
  } catch (err) {
    console.log("FAILED to connect to:", uri.replace(/:([^:@]+)@/, ":xxxx@"), "Error:", err.message);
    return false;
  }
}

async function main() {
  for (const uri of uris) {
    const success = await tryConnect(uri);
    if (success) {
      console.log("\nFound working database connection!");
      break;
    }
  }
}

main();
