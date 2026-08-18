const { MongoClient } = require('mongodb');
async function run() {
  const c = await MongoClient.connect('mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin');
  const db = c.db();
  const atts = await db.collection('dve_attendances').find({ score: { $exists: true } }).limit(5).toArray();
  console.log(JSON.stringify(atts, null, 2));
  c.close();
}
run();
