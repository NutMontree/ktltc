const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' }); // Load env variables if any, or .env

async function check() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  console.log("Connecting to:", uri);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    
    const ids = [
      "69f9c52562b57b51d01c4b57",
      "69f9c5f962b57b51d01c4b5d",
      "69f9c60562b57b51d01c4b5e"
    ];
    
    for (const id of ids) {
      console.log(`\n--- Inspecting Folder: ${id} ---`);
      const folder = await db.collection("drive_folders").findOne({ _id: new ObjectId(id) });
      if (folder) {
        console.log(JSON.stringify(folder, null, 2));
        
        // Also find child folders and files
        const childFolders = await db.collection("drive_folders").find({ parentId: new ObjectId(id) }).toArray();
        console.log(`Child Folders Count: ${childFolders.length}`);
        childFolders.forEach(f => console.log(`  - Folder: ${f.name} (isCollaborative: ${f.isCollaborative}, ownerId: ${f.ownerId})`));
        
        const childFiles = await db.collection("drive_files").find({ folderId: new ObjectId(id) }).toArray();
        console.log(`Child Files Count: ${childFiles.length}`);
        childFiles.forEach(f => console.log(`  - File: ${f.name} (ownerId: ${f.ownerId})`));
      } else {
        console.log("Folder not found!");
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

check();
