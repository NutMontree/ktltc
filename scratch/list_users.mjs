import clientPromise from '../src/lib/db.js';

async function listUsers() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
    
    console.log("Found Users:");
    console.table(users);
    
    process.exit(0);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
}

listUsers();
