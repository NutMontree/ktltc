import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Invalid User ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastActiveAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Active User Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
