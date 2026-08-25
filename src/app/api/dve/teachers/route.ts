import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher", "director", "deputy_academic"];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const teachers = await db
      .collection("users")
      .find({
        role: { $in: ALLOWED_ROLES },
      })
      .project({
        _id: 1,
        name: 1,
        department: 1,
        role: 1,
        image: 1,
        email: 1,
      })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      teachers: teachers.map((t) => ({
        id: t._id.toString(),
        name: t.name || "ไม่ระบุชื่อ",
        department: t.department || "ไม่ระบุแผนก",
        role: t.role || "teacher",
        image: t.image || "",
        email: t.email || "",
      })),
    });
  } catch (error: any) {
    console.error("[DVE Teachers GET API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
