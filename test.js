const fs=require('fs');
const env=fs.readFileSync('.env','utf8');
const uri=env.split('\n').find(l=>l.startsWith('MONGODB_URI=')).substring(12).trim().replace(/['"]/g,'');
const {MongoClient}=require('mongodb');
async function run(){
  const c=await MongoClient.connect(uri);
  const db=c.db('ktltc_db');
  
  const perms = await db.collection('role_permissions').findOne({role: 'teacher'});
  console.log('Teacher Perms:', perms?.permissions);
  
  await c.close();
}
run().catch(console.error);
