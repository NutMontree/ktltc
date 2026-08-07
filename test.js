const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const roles = await db.collection('users').distinct('role');
    console.log("Roles in users:", roles);
    
    const perms = await db.collection('role_permissions').find({}).toArray();
    console.log("Permissions:", JSON.stringify(perms, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
