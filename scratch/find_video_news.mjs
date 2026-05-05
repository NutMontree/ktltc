import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://admin:password1234@127.0.0.1:27017/ktltc_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const news = db.collection("news");
    
    const videoNews = await news.find({ 
      $or: [
        { images: { $regex: /\.(mp4|webm|mov|m4v)/i } },
        { announcementImages: { $regex: /\.(mp4|webm|mov|m4v)/i } }
      ]
    }).toArray();
    
    console.log(`Found ${videoNews.length} news items with videos.`);
    videoNews.forEach(n => {
      console.log(`ID: ${n._id}, Title: ${n.title}`);
      console.log(`Images: ${JSON.stringify(n.images)}`);
    });
    
  } finally {
    await client.close();
  }
}

run();
