const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('ktltc');
    const news = await db.collection('news').find({ 
      createdAt: { $lt: new Date('2025-01-01') } 
    }).sort({ createdAt: -1 }).limit(2).toArray();
    
    console.log(JSON.stringify(news, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.error);
