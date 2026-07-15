import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const usersCollection = db.collection("users");

    // Filter fake users directly in DB
    const deleteResult = await usersCollection.deleteMany({ email: { $regex: "^fake_" } });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleteResult.deletedCount} fake records.`, 
    });
  } catch (error) {
    console.error("Deletion error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
