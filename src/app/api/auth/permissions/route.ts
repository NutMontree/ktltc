import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role || "user";

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    const dbPermission = await db.collection("role_permissions").findOne({ role });
    
    // Default fallback if no custom permissions in DB
    const permissions = dbPermission?.permissions || {
      access_dashboard: ["super_admin", "admin", "hr", "director", "editor", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs"].includes(role),
      manage_users: ["super_admin"].includes(role),
      manage_news: ["super_admin", "admin", "editor"].includes(role),
      manage_pages: ["super_admin", "editor"].includes(role),
      manage_attendance: ["super_admin", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs"].includes(role),
      manage_qa: ["super_admin", "admin"].includes(role),
      manage_system: ["super_admin"].includes(role),
    };

    // Super admin always has everything
    if (role === "super_admin") {
      Object.keys(permissions).forEach(key => permissions[key] = true);
    }

    return NextResponse.json(permissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
