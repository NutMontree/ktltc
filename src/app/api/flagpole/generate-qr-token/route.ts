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
    const { department, classGroupId } = data;

    if (!department || !classGroupId) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุแผนกและกลุ่มเรียน" },
        { status: 400 }
      );
    }

    // Generate a secure JWT token that expires in 15 minutes
    const token = jwt.sign(
      { 
        department,
        classGroupId,
        teacherId: session.user.id,
        type: "flagpole_qr_checkin",
        date: new Date().toISOString().split('T')[0] // today's date
      },
      JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes expiration
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
