import { NextResponse } from "next/server";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "ktltc-secret-key-12345";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();

    if (!session || !["super_admin", "admin", "teacher", "director"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const department = data.department || "all";
    const classGroupId = data.classGroupId || "all";

    const serverTime = new Date();
    const thTime = new Date(serverTime.getTime() + 7 * 60 * 60 * 1000);
    const todayDateStr = thTime.toISOString().split('T')[0];

    // Generate a secure JWT token that is unique per day
    // By using noTimestamp: true, the token will be exactly the same string 
    // for the entire day, but will change tomorrow.
    const token = jwt.sign(
      { 
        department,
        classGroupId,
        teacherId: session.user.id,
        type: "flagpole_qr_checkin",
        date: todayDateStr
      },
      JWT_SECRET,
      { noTimestamp: true } 
    );

    return NextResponse.json({
      success: true,
      token
    });
  } catch (error: any) {
    console.error("QR Token Generation Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการสร้าง QR Code" },
      { status: 500 }
    );
  }
}
