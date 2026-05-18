import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit") || "30";
    const limit = parseInt(limitParam);

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let queryConditions = [];
    queryConditions.push({ userId: userId });
    
    if (ObjectId.isValid(userId)) {
      queryConditions.push({ userId: new ObjectId(userId) });
    }

    const flagpoleHistory = await db.collection("flagpole_attendances").find({ 
      $or: queryConditions
    })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ success: true, data: flagpoleHistory }, { status: 200 });
  } catch (error: any) {
    console.error("Flagpole History Endpoint Error:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
  }
}
