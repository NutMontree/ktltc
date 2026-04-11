import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const usersCollection = db.collection("users");

    // Fetch all users
    const allUsers = await usersCollection.find({}).toArray();
    
    // Filter fake users locally
    const fakeUsers = allUsers.filter(u => u.email && u.email.startsWith("fake_"));
    const toDeleteIds = fakeUsers.map(u => u._id);

    let deletedCount = 0;
    if (toDeleteIds.length > 0) {
      const deleteResult = await usersCollection.deleteMany({ _id: { $in: toDeleteIds } });
      deletedCount = deleteResult.deletedCount;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Found ${fakeUsers.length} fakes in array, successfully deleted ${deletedCount} fake records from data.ts migration.`, 
    });
  } catch (error) {
    console.error("Deletion error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
