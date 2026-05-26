import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * [POST] Estimate number of recipients for broadcast notification
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.role;
    if (userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden - Super Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { targetDepartments, targetRoles } = body;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Build query
    const query: any = {};
    const conditions = [];

    if (targetDepartments && targetDepartments.length > 0) {
      conditions.push({ department: { $in: targetDepartments } });
    }

    if (targetRoles && targetRoles.length > 0) {
      conditions.push({ role: { $in: targetRoles } });
    }

    if (conditions.length > 0) {
      query.$or = conditions;
    } else {
      return NextResponse.json({ success: true, count: 0 });
    }

    const count = await db.collection("users").countDocuments(query);

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("[Estimate Recipients API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
