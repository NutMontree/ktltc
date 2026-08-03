import { MongoClient } from 'mongodb';

const uri = "mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    
    const db = client.db("ktltc_db");
    
    const menus = [
      {
        title: "ระบบติดตาม PDCA",
        href: "/pdca",
        icon: "Activity",
        desc: "",
        workspace: "staff",
        displayIn: "both",
        permissionKey: `custom_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`,
        createdAt: new Date()
      },
      {
        title: "บันทึกข้อความทั่วไป",
        href: "/GeneralMemoPage",
        icon: "FileText",
        desc: "",
        workspace: "staff",
        displayIn: "both",
        permissionKey: `custom_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`,
        createdAt: new Date()
      },
      {
        title: "Chart Analytics",
        href: "/chart",
        icon: "BarChart2",
        desc: "",
        workspace: "staff",
        displayIn: "both",
        permissionKey: `custom_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`,
        createdAt: new Date()
      },
      {
        title: "แก้ไขหัวข้อฟอร์ม",
        href: "/form-editor",
        icon: "Edit",
        desc: "",
        workspace: "staff",
        displayIn: "both",
        permissionKey: `custom_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`,
        createdAt: new Date()
      },
      {
        title: "ตั้งค่าระบบภายใน",
        href: "/internal-form-editor",
        icon: "Settings",
        desc: "",
        workspace: "staff",
        displayIn: "both",
        permissionKey: `custom_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`,
        createdAt: new Date()
      }
    ];

    const result = await db.collection("custom_menus").insertMany(menus);
    console.log("Inserted menus:", result);

  } finally {
    await client.close();
  }
}

run().catch(console.error);
