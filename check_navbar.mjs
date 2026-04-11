import clientPromise from "./src/lib/db.js";

async function checkNavbar() {
  const client = await clientPromise;
  const db = client.db("ktltc_db");
  const items = await db.collection("navbar").find({}).sort({ order: 1 }).toArray();
  console.log(JSON.stringify(items, null, 2));
  process.exit(0);
}

checkNavbar();
