require('dotenv').config({ path: '.env' });
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkUser() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("No URI"); return; }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const user = await db.collection("users").findOne({ username: "somsak" });
    console.log("User:", user);
    
    if (user && user.role) {
      const perms = await db.collection("role_permissions").findOne({ role: user.role.toLowerCase() });
      console.log("Role Permissions:", perms);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
checkUser();
