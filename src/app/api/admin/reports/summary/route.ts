import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await (await import("@/lib/auth")).auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    if (!session || userRole !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await db
      .collection("logs")
      .aggregate([
        {
          $match: { timestamp: { $gte: thirtyDaysAgo } },
        },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            approvals: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: { $ifNull: ["$action", ""] }, regex: "APPROVE|ACCEPT", options: "i" } },
                  1,
                  0,
                ],
              },
            },
            roleChanges: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $regexMatch: { input: { $ifNull: ["$action", ""] }, regex: "ROLE|PERMISSION", options: "i" } },
                      { $regexMatch: { input: { $ifNull: ["$details", ""] }, regex: "เปลี่ยนสิทธิ์", options: "i" } },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            newMembers: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: { $ifNull: ["$action", ""] }, regex: "REGISTER", options: "i" } },
                  1,
                  0,
                ],
              },
            },
            updates: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: { $ifNull: ["$action", ""] }, regex: "UPDATE|EDIT|PATCH", options: "i" } },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    const result = stats[0] || {
      totalActions: 0,
      approvals: 0,
      roleChanges: 0,
      newMembers: 0,
      updates: 0,
    };

    const finalResult = {
      totalActions: result.totalActions,
      approvals: result.approvals,
      roleChanges: result.roleChanges,
      newMembers: result.newMembers,
      updates: result.updates,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Summary Report Error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
