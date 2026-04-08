import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    const allowedRoles = ["super_admin", "admin", "hr", "director", "deputy_director", "editor"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const roleParam = searchParams.get("role") || "all";

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. Fetch expected users matching criteria (exclude super_admin and basic user/students)
    const userMatch: any = { role: { $nin: ["super_admin", "user"] } };
    if (roleParam !== "all") {
      userMatch.role = roleParam;
    }

    const users = await db.collection("users").find(userMatch).project({
      _id: 1, name: 1, role: 1, department: 1
    }).toArray();

    // 2. Fetch reports within date range
    const startObj = new Date(startDateParam + "T00:00:00.000Z");
    const endObj = new Date(endDateParam + "T23:59:59.999Z");

    const reportsMatch: any = {
      date: { $gte: startObj, $lte: endObj }
    };

    const reports = await db.collection("work_reports").find(reportsMatch).project({
      userId: 1, date: 1
    }).toArray();

    // 3. Process daily summary
    const summaryList = [];
    const currentDate = new Date(startObj);
    
    // Normalize user array for fast lookup
    const allUsersMap = new Map();
    users.forEach(u => allUsersMap.set(u._id.toString(), u));

    while (currentDate <= endObj) {
      const dateStr = currentDate.toISOString().split("T")[0];
      
      // Filter reports for this exact date string
      const reportsForDay = reports.filter(r => {
        const rDateStr = new Date(r.date).toISOString().split("T")[0];
        return rDateStr === dateStr;
      });

      const submittedUserIds = new Set(reportsForDay.map(r => r.userId.toString()));
      const missingUsers: any[] = [];
      const submittedUsers: any[] = [];

      users.forEach(u => {
        if (submittedUserIds.has(u._id.toString())) {
          submittedUsers.push({
            id: u._id.toString(),
            name: u.name || "ไม่ทราบชื่อ",
            role: u.role || "",
            department: u.department || "ไม่มีแผนก"
          });
        } else {
          missingUsers.push({
            id: u._id.toString(),
            name: u.name || "ไม่ทราบชื่อ",
            role: u.role || "",
            department: u.department || "ไม่มีแผนก"
          });
        }
      });

      summaryList.push({
        date: dateStr,
        totalUsers: users.length,
        submittedCount: submittedUsers.length,
        missingCount: missingUsers.length,
        missingUsers,
        submittedUsers
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: summaryList.sort((a, b) => b.date.localeCompare(a.date)) // Sort newest first
    });

  } catch (error: any) {
    console.error("Daily Summary Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
