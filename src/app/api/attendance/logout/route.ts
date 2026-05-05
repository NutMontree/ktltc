import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const userName = (session?.user as any)?.name || "Unknown";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // บันทึก log การออกจากระบบ
    await db.collection("logs").insertOne({
      userName,
      userId: new ObjectId(userId),
      action: "LOGOUT",
      details: `${userName} ออกจากระบบ`,
      module: "AUTH",
      timestamp: new Date(),
      ip,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout log error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
