import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth, hasPermission } from "@/lib/auth"; // เปลี่ยนมาใช้ตัวนี้

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session?.user as any)?.role?.toLowerCase();

    // Check dynamic permissions
    const canManageRoles = await hasPermission(userRole, "manage_roles_advanced");

    if (!canManageRoles) {
      return NextResponse.json({ error: "สิทธิ์ไม่เพียงพอ: No permission for Role Management" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // Adjusted back to 20 for "Load More"
    const search = searchParams.get("search") || "";
    const isAll = searchParams.get("all") === "true";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } }
      ];
    }

    const status = searchParams.get("status");
    if (status === "pending") {
      query.isActive = false;
    } else if (status === "active") {
      query.isActive = true;
    }

    const role = searchParams.get("role");
    if (role && role !== "all") {
      query.role = role;
    }

    const total = await db.collection("users").countDocuments(query);

    // Get active user counts grouped by role for dashboard tabs
    const roleCounts = await db.collection("users").aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]).toArray();

    const roleCountsMap = roleCounts.reduce((acc: any, curr: any) => {
      acc[curr._id || "user"] = curr.count;
      return acc;
    }, {});
    
    let usersQuery = db
      .collection("users")
      .find(query)
      .sort({ orderIndex: 1, createdAt: -1 })
      .project({ password: 0 });

    if (!isAll) {
      usersQuery = usersQuery.skip((page - 1) * limit).limit(limit);
    }

    const users = await usersQuery.toArray();

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      hasMore: total > page * limit,
      roleCounts: roleCountsMap
    });
  } catch (error) {
    console.error("Admin Users API Error:", error);
    return NextResponse.json({ error: "Database Error" }, { status: 500 });
  }
}
