import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// --- POST: Increment folder views count ---
export async function POST(request: Request) {
  try {
    const { folderId } = await request.json();
    if (!folderId) return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Increment count securely
    await db.collection("drive_folders").updateOne(
      { _id: new ObjectId(folderId) },
      { $inc: { views: 1 } }
    );

    // Fetch the updated value
    const updated = await db.collection("drive_folders").findOne({ _id: new ObjectId(folderId) });
    const views = updated?.views || 0;

    return NextResponse.json({ success: true, views });
  } catch (error) {
    console.error("Increment Views API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
