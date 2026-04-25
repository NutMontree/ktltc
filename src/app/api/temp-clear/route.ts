import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Find super_admin users
    const result = await db.collection("users").updateMany(
      { role: "super_admin" },
      { $set: { friends: [] } }
    );

    // Clear all friend requests involving super_admin
    const superAdmins = await db.collection("users").find({ role: "super_admin" }).toArray();
    const superAdminIds = superAdmins.map(admin => admin._id);

    const requestResult = await db.collection("friendRequests").deleteMany({
      $or: [
        { from: { $in: superAdminIds } },
        { to: { $in: superAdminIds } }
      ]
    });

    return NextResponse.json({
      success: true,
      message: "Cleared friends for super_admin",
      usersUpdated: result.modifiedCount,
      requestsDeleted: requestResult.deletedCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
