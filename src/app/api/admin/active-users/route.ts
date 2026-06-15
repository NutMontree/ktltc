import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();

    // Check if user has permission to view active users
    if (!["super_admin", "admin", "director"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    const activeUsers = await db
      .collection("users")
      .find(
        { lastActiveAt: { $gt: fifteenMinsAgo } },
        { projection: { password: 0 } }
      )
      .sort({ lastActiveAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: activeUsers });
  } catch (error) {
    console.error("Fetch Active Users Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
