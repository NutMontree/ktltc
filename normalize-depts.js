require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const collection = db.collection('student_care_records');
    
    const uniqueDepts = await collection.distinct("department");
    console.log("Found departments:", uniqueDepts);
    
    let updated = 0;
    
    for (const d of uniqueDepts) {
      if (!d) continue;
      
      let newDept = d.trim();
      
      // Known duplicates from the user's images
      if (newDept === "งานการบัญชี" || newDept === "บัญชี") newDept = "แผนกวิชาการบัญชี";
      else if (newDept === "ช่างกลโรงงาน") newDept = "แผนกวิชาช่างกลโรงงาน";
      else if (newDept === "แผนกช่างไฟฟ้ากำลัง" || newDept === "ไฟฟ้ากำลัง") newDept = "แผนกวิชาช่างไฟฟ้ากำลัง";
      else if (newDept === "คอมพิวเตอร์เกมและแอนิเมชัน" || newDept.includes("เกมและแอ")) newDept = "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล"; // Usually under IT/Digital Business
      else if (newDept === "เทคนิคการผลิต") newDept = "แผนกวิชาช่างกลโรงงาน"; // Usually under Factory Mechanic
      else if (newDept === "เคาทรอนิกส์และหุ่นยนต์" || newDept.includes("เมคคา")) newDept = "แผนกวิชาช่างอิเล็กทรอนิกส์"; // Usually under Electronics

      // General missing prefixes
      if (!newDept.startsWith("แผนกวิชา") && !newDept.startsWith("การจัดการ")) {
          if (newDept === "ช่างยนต์") newDept = "แผนกวิชาช่างยนต์";
          if (newDept === "ช่างเชื่อมโลหะ" || newDept === "ช่างเชื่อม") newDept = "แผนกวิชาช่างเชื่อมโลหะ";
          if (newDept === "ช่างเทคนิคพื้นฐาน") newDept = "แผนกวิชาช่างเทคนิคพื้นฐาน";
          if (newDept === "ช่างก่อสร้าง") newDept = "แผนกวิชาช่างก่อสร้าง";
          if (newDept === "การตลาด") newDept = "แผนกวิชาการตลาด";
          if (newDept === "เทคโนโลยีธุรกิจดิจิทัล") newDept = "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
          if (newDept === "การโรงแรม") newDept = "แผนกวิชาการโรงแรม";
          if (newDept === "สามัญสัมพันธ์") newDept = "แผนกวิชาสามัญสัมพันธ์";
          if (newDept === "ยานยนต์ไฟฟ้า") newDept = "แผนกวิชายานยนต์ไฟฟ้า";
      }

      if (d !== newDept) {
        const result = await collection.updateMany(
          { department: d },
          { $set: { department: newDept } }
        );
        updated += result.modifiedCount;
        console.log(`Changed "${d}" to "${newDept}" (${result.modifiedCount} records)`);
      }
    }
    
    console.log(`Done. Updated ${updated} records.`);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main();
