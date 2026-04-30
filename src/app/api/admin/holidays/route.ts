import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [GET] ดึงรายการวันหยุดทั้งหมด
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session || !["super_admin", "admin", "hr", "staff"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const holidays = await db.collection("holidays").find({}).sort({ date: 1 }).toArray();
    return NextResponse.json(holidays);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * [POST] เพิ่มวันหยุดใหม่
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !["super_admin", "admin", "hr"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { date, name, type } = body; // type: 'public', 'internal'

    if (!date || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // แปลงวันที่ให้เป็นเวลา 00:00:00.000Z
    const holidayDate = new Date(date);
    holidayDate.setUTCHours(0, 0, 0, 0);

    const result = await db.collection("holidays").updateOne(
      { date: holidayDate },
      { 
        $set: { 
          name, 
          type: type || 'public',
          updatedAt: new Date(),
          createdBy: (session.user as any).name
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * [DELETE] ลบวันหยุด
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !["super_admin", "admin", "hr"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("holidays").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
