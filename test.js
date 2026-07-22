const fs=require('fs');
const env=fs.readFileSync('.env','utf8');
const uri=env.split('\n').find(l=>l.startsWith('MONGODB_URI=')).substring(12).trim().replace(/['"]/g,'');
const {MongoClient}=require('mongodb');
async function run(){
  const c=await MongoClient.connect(uri);
  const db=c.db('ktltc_db');
  
  const customMenus = await db.collection('custom_menus').find({}).toArray();
  console.log('Custom Menus:', customMenus);
  
  await c.close();
}
run().catch(console.error);
