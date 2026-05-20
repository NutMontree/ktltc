const { MongoClient } = require('mongodb');

const ips = ['192.168.6.179', '192.168.6.232'];
const password = "Nut29122539"; // from our previous URI

async function probeIP(ip) {
  const uri = `mongodb://nut:${password}@${ip}:27017/ktltc_db?authSource=admin`;
  const client = new MongoClient(uri, { connectTimeoutMS: 3000, serverSelectionTimeoutMS: 3000 });
  
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    
    let newsCount = 0;
    let usersCount = 0;
    
    if (names.includes('news')) {
      newsCount = await db.collection('news').countDocuments();
    }
    if (names.includes('users')) {
      usersCount = await db.collection('users').countDocuments();
    }
    
    console.log(`✅ SUCCESS on ${ip}:`);
    console.log(`   Collections: ${names.join(', ')}`);
    console.log(`   News posts: ${newsCount}`);
    console.log(`   Users: ${usersCount}`);
    return true;
  } catch (err) {
    console.log(`❌ FAILED on ${ip}: ${err.message}`);
    return false;
  } finally {
    await client.close();
  }
}

async function run() {
  console.log("🚀 Probing discovered database servers...");
  for (const ip of ips) {
    await probeIP(ip);
  }
  console.log("=========================================");
}

run();
