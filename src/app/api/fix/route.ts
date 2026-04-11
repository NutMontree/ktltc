import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const usersCollection = db.collection("users");

    // Fetch all users
    const allUsers = await usersCollection.find({}).toArray();
    
    // Group by name
    const groupedUsers: Record<string, any[]> = {};
    for (const u of allUsers) {
      if (!u.name) continue;
      if (!groupedUsers[u.name]) {
        groupedUsers[u.name] = [];
      }
      groupedUsers[u.name].push(u);
    }

    let deletedCount = 0;
    const deletedNames = [];

    // Delete duplicates
    for (const name in groupedUsers) {
      const records = groupedUsers[name];
      if (records.length > 1) {
        // Keep the first one, delete the rest
        const toDeleteIds = records.slice(1).map(r => r._id);
        if (toDeleteIds.length > 0) {
          await usersCollection.deleteMany({ _id: { $in: toDeleteIds } });
          deletedCount += toDeleteIds.length;
          deletedNames.push(name);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deletedCount} duplicate records.`, 
      deletedNames 
    });
  } catch (error) {
    console.error("Deduplication error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
