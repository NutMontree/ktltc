const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

async function syncNavbar() {
  console.log("Starting navbar sync script...");
  const envFile = fs.readFileSync('.env', 'utf8');
  const match = envFile.match(/MONGODB_URI=(.*)/);
  if (!match) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }
  const uri = match[1].trim();
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const col = db.collection("navbar");

    // 1. Find or create the parent item "ข้อมูลบุคลากร"
    let parent = await col.findOne({ label: "ข้อมูลบุคลากร", parentId: null });

    if (!parent) {
      console.log("Parent 'ข้อมูลบุคลากร' not found. Creating...");
      const count = await col.countDocuments({ parentId: null });
      const inserted = await col.insertOne({
        label: "ข้อมูลบุคลากร",
        path: "/personnel",
        order: count + 1,
        parentId: null,
        createdAt: new Date(),
      });
      parent = await col.findOne({ _id: inserted.insertedId });
    }

    if (!parent) {
      console.error("Could not find or create parent item");
      process.exit(1);
    }

    const parentId = parent._id.toString();
    console.log(`Parent 'ข้อมูลบุคลากร' resolved with ID: ${parentId}`);

    // 2. Define the exact departments (standardized list including the two new ones)
    const departments = [
      { label: "ทำเนียบผู้บริหาร",               path: "/executiveboard",  order: 1 },
      { label: "แผนกวิชาช่างยนต์",                path: "/mechanic",        order: 2 },
      { label: "แผนกวิชาช่างกลโรงงาน",            path: "/machine",         order: 3 },
      { label: "แผนกวิชาช่างเชื่อมโลหะ",           path: "/welder",          order: 4 },
      { label: "แผนกวิชาช่างไฟฟ้ากำลัง",           path: "/electricity",     order: 5 },
      { label: "แผนกวิชาช่างอิเล็กทรอนิกส์",       path: "/electronics",     order: 6 },
      { label: "แผนกวิชาช่างเทคนิคพื้นฐาน",        path: "/technique",       order: 7 },
      { label: "แผนกวิชาช่างก่อสร้าง",             path: "/construct",       order: 8 },
      { label: "แผนกวิชาการบัญชี",                path: "/accounting",      order: 9 },
      { label: "แผนกวิชาการตลาด",                 path: "/marketing",       order: 10 },
      { label: "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล",  path: "/technology",      order: 11 },
      { label: "แผนกวิชาการโรงแรม",               path: "/hotel",           order: 12 },
      { label: "แผนกวิชาสามัญสัมพันธ์",            path: "/ordinary",        order: 13 },
      { label: "แผนกวิชายานยนต์ไฟฟ้า",            path: "/ev",              order: 14 },
      { label: "แผนกวิชาการตลาด/โลจิสติก์",       path: "/logistics",       order: 15 },
      { label: "การจัดการสำนักงานดิจิทัล",         path: "/digital-office",  order: 16 },
      { label: "การจัดการโลจิสติกส์และซัพพลายเชน",   path: "/supply-chain",    order: 17 },
    ];

    // 3. Sync each department menu item
    for (const dept of departments) {
      const existing = await col.findOne({ label: dept.label, parentId });

      if (existing) {
        await col.updateOne(
          { _id: existing._id },
          { $set: { path: dept.path, order: dept.order, parentId, updatedAt: new Date() } }
        );
        console.log(`✅ Updated: ${dept.label} -> order: ${dept.order}`);
      } else {
        await col.insertOne({
          label: dept.label,
          path: dept.path,
          order: dept.order,
          parentId,
          createdAt: new Date(),
        });
        console.log(`➕ Created new: ${dept.label} -> order: ${dept.order}`);
      }
    }

    // 4. Delete items under "ข้อมูลบุคลากร" that are no longer valid (standardization cleanup)
    const validLabels = departments.map((d) => d.label);
    const deleteResult = await col.deleteMany({
      parentId,
      label: { $nin: validLabels },
    });
    console.log(`🗑️ Cleaned up: Deleted ${deleteResult.deletedCount} outdated sub-menu items.`);

    console.log("🎉 Navbar personnel sync successfully completed!");
  } catch (error) {
    console.error("❌ Error running sync-navbar script:", error);
  } finally {
    await client.close();
  }
}

syncNavbar();
