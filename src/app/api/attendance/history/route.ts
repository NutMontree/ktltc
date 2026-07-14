import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

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
    } else {
      // If it somehow isn't a valid ObjectId but we still want to query it as string
      console.warn("User ID in session is not a valid ObjectId:", userId);
    }

    let attendances = await db.collection("attendances").find({ 
      $or: queryConditions
    })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    if (attendances.length === 0) {
      console.log(`[API /history] User ${userId} has no history.`);
    } else {
      console.log(`[API /history] User ${userId} requested history. Found ${attendances.length} records.`);
    }

    return NextResponse.json({ success: true, data: attendances }, { status: 200 });
  } catch (error: any) {
    console.error("History Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
