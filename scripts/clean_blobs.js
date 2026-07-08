const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin';

async function cleanBlobs() {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db('ktltc_db');
    const collection = db.collection('ita_items');

    const items = await collection.find({}).toArray();
    let updatedCount = 0;

    for (const item of items) {
      if (item.links && Array.isArray(item.links)) {
        const originalLength = item.links.length;
        const newLinks = item.links.filter(link => !link.url.endsWith('-blob'));
        
        if (newLinks.length !== originalLength) {
          await collection.updateOne(
            { _id: item._id },
            { $set: { links: newLinks } }
          );
          console.log(`Cleaned blob links from item: ${item.oitCode} (${item.year})`);
          updatedCount++;
        }
      }
    }
    console.log(`Total items updated in DB: ${updatedCount}`);

    // Clean files from public/uploads
    const uploadDir = path.join(__dirname, '../public/uploads');
    const files = fs.readdirSync(uploadDir);
    let deletedFiles = 0;
    for (const file of files) {
      if (file.endsWith('-blob')) {
        fs.unlinkSync(path.join(uploadDir, file));
        deletedFiles++;
      }
    }
    console.log(`Total -blob files deleted from uploads: ${deletedFiles}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) await client.close();
  }
}

cleanBlobs();
