import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const usersCollection = db.collection("users");

    // Delete fake users migrated from data.ts
    const result = await usersCollection.deleteMany({ email: { $regex: /^fake_/i } });

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} fake records from data.ts migration.`, 
    });
  } catch (error) {
    console.error("Deletion error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
