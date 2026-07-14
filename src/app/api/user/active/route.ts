import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Invalid User ID" }, { status: 400 });
    }
    
    let path = "";
    try {
      const body = await req.json();
      path = body?.path || "";
    } catch (e) {
      // Ignore if body is empty or invalid
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateData: any = { lastActiveAt: new Date() };
    if (path) {
      updateData.lastActivePath = path;
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Active User Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
