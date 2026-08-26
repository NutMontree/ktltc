const { MongoClient } = require('mongodb');
require('dotenv').config();

async function syncKnowledgeBase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db('ktltc_db');
    const kb = db.collection('ai_knowledge_base');

    // เคลียร์ข้อมูลเก่า
    console.log("Clearing old knowledge base...");
    await kb.deleteMany({});

    // 1. นำเข้าข้อมูลบุคลากร (Users) - กรองเอาเฉพาะครู/บุคลากร (ไม่เอานักเรียน)
    console.log("Syncing staff & teachers...");
    const users = await db.collection('users').find({ role: { $ne: 'student' } }).toArray();
    const userDocs = users.map(u => ({
      type: 'user',
      title: `บุคลากร: ${u.name || u.firstName || ''} ${u.lastName || ''}`,
      content: `ชื่อ: ${u.name || u.firstName || ''} ${u.lastName || ''}\nตำแหน่ง: ${u.position || 'พนักงาน'}\nแผนก/สาขา: ${u.department || 'ไม่ระบุ'}\nสังกัด: ${u.faculty || 'ไม่ระบุ'}`,
      source_id: u._id
    })).filter(u => u.title.trim() !== 'บุคลากร:');
    
    if (userDocs.length > 0) await kb.insertMany(userDocs);
    console.log(`- Synced ${userDocs.length} users.`);

    // 2. นำเข้าข้อมูลข่าว (News)
    console.log("Syncing news...");
    const news = await db.collection('news').find({}).sort({ createdAt: -1 }).limit(500).toArray();
    const newsDocs = news.map(n => {
      const plainContent = (n.content || "").replace(/<[^>]+>/g, '').substring(0, 1000);
      return {
        type: 'news',
        title: `ข่าว/ประกาศ: ${n.title}`,
        content: `หมวดหมู่: ${n.category || 'ทั่วไป'}\nวันที่: ${n.createdAt || ''}\nเนื้อหา: ${plainContent}`,
        source_id: n._id
      };
    });
    
    if (newsDocs.length > 0) await kb.insertMany(newsDocs);
    console.log(`- Synced ${newsDocs.length} news posts.`);

    // 3. นำเข้าข้อมูลหน้าเว็บ (Pages)
    console.log("Syncing pages...");
    const pages = await db.collection('pages').find({}).toArray();
    const pageDocs = pages.map(p => {
      const plainContent = (p.content || "").replace(/<[^>]+>/g, '').substring(0, 1000);
      return {
        type: 'page',
        title: `ข้อมูลเว็บไซต์: ${p.title}`,
        content: plainContent,
        source_id: p._id
      };
    });
    
    if (pageDocs.length > 0) await kb.insertMany(pageDocs);
    console.log(`- Synced ${pageDocs.length} pages.`);

    // สร้าง Text Index สำหรับระบบค้นหา
    console.log("Creating Text Index...");
    await kb.createIndex({ title: "text", content: "text" });
    console.log("✅ Sync Complete!");

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

syncKnowledgeBase();
