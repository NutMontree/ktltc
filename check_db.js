const { MongoClient } = require('mongodb');

async function checkDB() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('ktltc_db');
  const config = await db.collection('dve_grading_configs').findOne({});
  console.log(JSON.stringify(config.categories.map(c => ({
    name: c.name,
    subCategories: c.subCategories
  })), null, 2));
  client.close();
}

checkDB();
