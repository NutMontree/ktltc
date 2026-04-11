import pkg from 'mongodb';
const { MongoClient } = pkg;

const uri = "mongodb://127.0.0.1:27017"; // Assuming local or env variable
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("ktltc_db");
    const navbar = db.collection("navbar");
    
    const parent = await navbar.findOne({ label: "ข้อมูลบุคลากร" });
    if (parent) {
      console.log("PARENT_ID:" + parent._id.toString());
      
      const children = [
        { label: "คณะกรรมการบริหารสถานศึกษา", path: "/executiveboard", order: 1, parentId: parent._id.toString() },
        { label: "บุคลากรแยกตามฝ่าย", path: "/personnel", order: 2, parentId: parent._id.toString() },
        { label: "บุคลากรแยกตามแผนกวิชา", path: "/personnel", order: 3, parentId: parent._id.toString() }
      ];
      
      for (const child of children) {
        const exists = await navbar.findOne({ label: child.label, parentId: child.parentId });
        if (!exists) {
           await navbar.insertOne({ ...child, createdAt: new Date() });
           console.log("Added: " + child.label);
        } else {
           console.log("Exists: " + child.label);
        }
      }
    } else {
      console.log("Parent 'ข้อมูลบุคลากร' not found.");
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
