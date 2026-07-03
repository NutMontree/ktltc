const { MongoClient } = require('mongodb');

async function clear() { 
  const client = new MongoClient('mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin'); 
  try {
    await client.connect(); 
    const db = client.db('ktltc_db'); 
    
    // Remove all active tracking sessions
    const sessionRes = await db.collection('off_campus_sessions').deleteMany({ status: 'ACTIVE' }); 
    console.log(`Deleted ${sessionRes.deletedCount} active sessions.`);
    
    // Unset currentLocation from all users
    const userRes = await db.collection('users').updateMany({}, { $unset: { currentLocation: '' } }); 
    console.log(`Cleared currentLocation from ${userRes.modifiedCount} users.`);
    
  } catch (error) {
    console.error("Error clearing DB:", error);
  } finally {
    await client.close(); 
    console.log('Cleared mock sessions and locations'); 
  }
} 

clear();
