import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { leaveType, startDate, endDate, reason, attachmentUrl } = data;

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const leaveRequest = {
      userId: new ObjectId(userId),
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      attachmentUrl: attachmentUrl || null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("leave_requests").insertOne(leaveRequest);

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error("Leave Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let queryConditions = [];
    queryConditions.push({ userId: userId });
    
    if (ObjectId.isValid(userId)) {
      queryConditions.push({ userId: new ObjectId(userId) });
    }

    const leaves = await db
      .collection("leave_requests")
      .find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(leaves, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
