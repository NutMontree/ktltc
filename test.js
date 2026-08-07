const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://nut:Nut29122539@100.64.196.104:27017/ktltc_db?authSource=admin";

async function checkDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const navbarCount = await db.collection("navbar").countDocuments();
    const pdcaCount = await db.collection("pdcas").countDocuments();
    console.log(`Navbar items: ${navbarCount}`);
    console.log(`Pdca items: ${pdcaCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
checkDB();
