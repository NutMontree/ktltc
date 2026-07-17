import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { role: 1, department: 1, faction: 1, isActive: 1 } }
    );
    
    if (!user) {
      return NextResponse.json({ error: "Not found", isActive: false }, { status: 404 });
    }

    // หาก user.isActive เป็น false (โดนระงับ) เราจะส่งกลับไปให้ Token ทราบ
    return NextResponse.json({
      role: user.role,
      department: user.department,
      faction: user.faction,
      isActive: user.isActive !== false // ถ้าไม่มีฟิลด์นี้ ถือว่า active
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
