import clientPromise from '../src/lib/db';
import { saveFileLocally } from '../src/lib/upload-server';


/**
 * Download a remote image URL and save it locally.
 * Returns the new public path (e.g. "/uploads/user_profiles/…jpg") or null on failure.
 */
async function downloadAndSave(url: string, folder: string, prefix: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to download ${url}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const newPath = await saveFileLocally(buffer, folder, prefix);
    return newPath;
  } catch (e) {
    console.error('❌ Migration error for', url, e);
    return null;
  }
}

/**
 * Main migration routine – scans collections for Cloudinary URLs and rewrites them.
 * Add/remove collections here as your schema evolves.
 */
async function migrate() {
  const client = await clientPromise;
  const db = client.db('ktltc_db');

  // ----- Users (profile & cover) -----
  const users = await db
    .collection('users')
    .find({ $or: [{ image: { $regex: 'cloudinary' } }, { coverImage: { $regex: 'cloudinary' } }] })
    .toArray();
  for (const u of users) {
    const updates: any = {};
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

  // ----- News (images array) -----
  const news = await db
    .collection('news')
    .find({ images: { $elemMatch: { $regex: 'cloudinary' } } })
    .toArray();
  for (const n of news) {
    const newImages: string[] = [];
    for (const img of n.images) {
      if (typeof img === 'string' && img.includes('cloudinary')) {
        const newImg = await downloadAndSave(img, 'news', `news-${n._id}`);
        if (newImg) newImages.push(newImg);
      } else {
        newImages.push(img as string);
      }
    }
    await db.collection('news').updateOne({ _id: n._id }, { $set: { images: newImages } });
    console.log('✅ News', n._id, 'images migrated');
  }

  // ----- Banners (single image) -----
  const banners = await db.collection('banners').find({ imageUrl: { $regex: 'cloudinary' } }).toArray();
  for (const b of banners) {
    const newImg = await downloadAndSave(b.imageUrl, 'banners', `banner-${b._id}`);
    if (newImg) {
      await db.collection('banners').updateOne({ _id: b._id }, { $set: { imageUrl: newImg } });
      console.log('✅ Banner', b._id, 'migrated');
    }
  }

  // ----- Posts (image & images array) -----
  const posts = await db
    .collection('posts')
    .find({ $or: [{ image: { $regex: 'cloudinary' } }, { images: { $elemMatch: { $regex: 'cloudinary' } } }] })
    .toArray();
  for (const p of posts) {
    const updates: any = {};
    if (typeof p.image === 'string' && p.image.includes('cloudinary')) {
      const newImg = await downloadAndSave(p.image, 'posts', `post-${p._id}`);
      if (newImg) updates.image = newImg;
    }
    if (Array.isArray(p.images)) {
      const newImgs: string[] = [];
      for (const img of p.images) {
        if (typeof img === 'string' && img.includes('cloudinary')) {
          const newImg = await downloadAndSave(img, 'posts', `post-${p._id}`);
          if (newImg) newImgs.push(newImg);
        } else {
          newImgs.push(img as string);
        }
      }
      updates.images = newImgs;
    }
    if (Object.keys(updates).length) {
      await db.collection('posts').updateOne({ _id: p._id }, { $set: updates });
      console.log('✅ Post', p._id, 'migrated');
    }
  }

  console.log('🎉 Migration complete!');
}

if (require.main === module) {
  migrate().catch(err => {
    console.error('❌ Migration failed', err);
    process.exit(1);
  });
}
