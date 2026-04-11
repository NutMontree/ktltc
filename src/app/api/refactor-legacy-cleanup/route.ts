import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Delete any users that have an email starting with "fake_"
    const result = await db.collection("users").deleteMany({
      email: { $regex: /^fake_/ }
    });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error("Cleanup failed:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: error.message, stack: error.stack },
      { status: 200 }
    );
  }
}
