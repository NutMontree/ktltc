import clientPromise from "./src/lib/db";

async function check() {
  const client = await clientPromise;
  const db = client.db("ktltc_db");
  const notif = await db.collection("notifications").findOne({});
  console.log(JSON.stringify(notif, null, 2));
  process.exit(0);
}

check();
