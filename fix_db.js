const { MongoClient } = require('mongodb');
const uri = 'mongodb://nut:Nut29122539@127.0.0.1:27017/ktltc_db?authSource=admin';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    
    // Find how many records exist for each
    const c1 = await db.collection('teachingrecords').countDocuments({ signerName: 'ณัช มนตรี' });
    const c2 = await db.collection('teachingrecords').countDocuments({ signerName: 'นายณัช มนตรี' });
    console.log(`Before update: ณัช มนตรี = ${c1}, นายณัช มนตรี = ${c2}`);
    
    // Update all 'นายณัช มนตรี' to 'ณัช มนตรี'
    const result = await db.collection('teachingrecords').updateMany(
      { signerName: 'นายณัช มนตรี' },
      { $set: { signerName: 'ณัช มนตรี' } }
    );
    console.log('Updated records:', result.modifiedCount);
    
    const c3 = await db.collection('teachingrecords').countDocuments({ signerName: 'ณัช มนตรี' });
    const c4 = await db.collection('teachingrecords').countDocuments({ signerName: 'นายณัช มนตรี' });
    console.log(`After update: ณัช มนตรี = ${c3}, นายณัช มนตรี = ${c4}`);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
