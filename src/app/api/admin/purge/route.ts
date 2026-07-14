import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const role = session?.user?.role;
    
    if (role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized. Super Admin Only." }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    console.log("🔥 [PURGE] Super Admin triggered data cleanup...");

    const attResult = await db.collection("attendances").deleteMany({});
    const leaveResult = await db.collection("leave_requests").deleteMany({});
    const logResult = await db.collection("logs").deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: "Data Purge Complete",
      deleted: {
        attendances: attResult.deletedCount,
        leave_requests: leaveResult.deletedCount,
        logs: logResult.deletedCount
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
