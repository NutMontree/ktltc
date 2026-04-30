require('dotenv').config();
const { MongoClient } = require('mongodb');
const { writeFile, mkdir } = require('fs/promises');
const path = require('path');
const https = require('https');
const http = require('http');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env");
  process.exit(1);
}

// Minimal implementation of saveFileLocally
async function saveFileLocally(buffer, folder = "uploads", filenamePrefix = "file") {
  try {
    const ext = "jpg"; // default assumption since we just take buffer here
    const filename = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    return `/${folder}/${filename}`;
  } catch (error) {
    console.error("❌ saveFileLocally Error:", error);
    return null;
  }
}

// Minimal download function using native http/https
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function downloadAndSave(url, folder, prefix) {
  try {
    const buffer = await downloadBuffer(url);
    const saved = await saveFileLocally(buffer, folder, prefix);
    return saved;
  } catch (e) {
    console.error('❌ Migration error for', url, e.message);
    return null;
  }
}

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('ktltc_db');

    // ---------- Users ----------
    const users = await db.collection('users').find({ $or: [{ image: { $regex: 'cloudinary' } }, { coverImage: { $regex: 'cloudinary' } }] }).toArray();
    for (const u of users) {
      const updates = {};
      if (typeof u.image === 'string' && u.image.includes('cloudinary')) {
        const newImg = await downloadAndSave(u.image, 'user_profiles', `profile-${u._id}`);
        if (newImg) updates.image = newImg;
      }
      if (typeof u.coverImage === 'string' && u.coverImage.includes('cloudinary')) {
        const newCover = await downloadAndSave(u.coverImage, 'user_covers', `cover-${u._id}`);
        if (newCover) updates.coverImage = newCover;
      }
      if (Object.keys(updates).length) {
        await db.collection('users').updateOne({ _id: u._id }, { $set: updates });
        console.log('✅ User', u._id, 'updated');
      }
    }

    // ---------- News ----------
    const news = await db.collection('news').find({ images: { $elemMatch: { $regex: 'cloudinary' } } }).toArray();
    for (const n of news) {
      const newImgs = [];
      for (const img of n.images) {
        if (typeof img === 'string' && img.includes('cloudinary')) {
          const saved = await downloadAndSave(img, 'news', `news-${n._id}`);
          newImgs.push(saved || img);
        } else {
          newImgs.push(img);
        }
      }
      await db.collection('news').updateOne({ _id: n._id }, { $set: { images: newImgs } });
      console.log('✅ News', n._id, 'images migrated');
    }

    // ---------- Banners ----------
    const banners = await db.collection('banners').find({ imageUrl: { $regex: 'cloudinary' } }).toArray();
    for (const b of banners) {
      const newImg = await downloadAndSave(b.imageUrl, 'banners', `banner-${b._id}`);
      if (newImg) {
        await db.collection('banners').updateOne({ _id: b._id }, { $set: { imageUrl: newImg } });
        console.log('✅ Banner', b._id, 'migrated');
      }
    }

    // ---------- Posts ----------
    const posts = await db.collection('posts').find({ $or: [{ image: { $regex: 'cloudinary' } }, { images: { $elemMatch: { $regex: 'cloudinary' } } }] }).toArray();
    for (const p of posts) {
      const updates = {};
      if (typeof p.image === 'string' && p.image.includes('cloudinary')) {
        const newImg = await downloadAndSave(p.image, 'posts', `post-${p._id}`);
        if (newImg) updates.image = newImg;
      }
      if (Array.isArray(p.images)) {
        const newArr = [];
        for (const img of p.images) {
          if (typeof img === 'string' && img.includes('cloudinary')) {
            const saved = await downloadAndSave(img, 'posts', `post-${p._id}`);
            newArr.push(saved || img);
          } else {
            newArr.push(img);
          }
        }
        updates.images = newArr;
      }
      if (Object.keys(updates).length) {
        await db.collection('posts').updateOne({ _id: p._id }, { $set: updates });
        console.log('✅ Post', p._id, 'migrated');
      }
    }

    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error("❌ Migration failed", error);
  } finally {
    await client.close();
  }
}

migrate();
