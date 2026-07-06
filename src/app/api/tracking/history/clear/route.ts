import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();

    if (userRole !== "super_admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin only." }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("off_campus_sessions").deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: "All history records cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Clear History Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
