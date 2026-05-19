import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to mask and format Citizen ID: e.g. 3120500123456 -> 3-1205-XXXXX-XX-6
const formatMaskedCitizenId = (rawId: string): string => {
  if (!rawId) return "ไม่ระบุ";
  const clean = rawId.replace(/[^0-9]/g, "");
  if (clean.length !== 13) return rawId;
  
  const part1 = clean.substring(0, 1);
  const part2 = clean.substring(1, 5);
  const part3 = "XXXXX";
  const part4 = "XX";
  const part5 = clean.substring(12, 13);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};

// Helper to mask Phone: e.g. 0812345678 -> 081-XXX-5678
const formatMaskedPhone = (rawPhone: string): string => {
  if (!rawPhone) return "ไม่ระบุ";
  const clean = rawPhone.replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    return `${clean.substring(0, 3)}-XXX-${clean.substring(6)}`;
  }
  return rawPhone;
};

// Helper to mask Email: e.g. somchai@gmail.com -> so***i@gmail.com
const formatMaskedEmail = (rawEmail: string): string => {
  if (!rawEmail || !rawEmail.includes("@")) return "ไม่ระบุ";
  const [local, domain] = rawEmail.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.substring(0, 2)}***${local.substring(local.length - 1)}@${domain}`;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.trim();
    const citizenId = searchParams.get("citizenId")?.trim();

    if (!name && !citizenId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุชื่อ-นามสกุล หรือเลขบัตรประจำตัวประชาชนในการค้นหา" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Standard filter for student role
    const query: any = { role: "student" };

    if (citizenId) {
      // Sanitize citizenId: strip dashes and spaces
      const sanitizedId = citizenId.replace(/[^0-9]/g, "");
      if (sanitizedId.length !== 13) {
        return NextResponse.json(
          { success: false, error: "เลขบัตรประจำตัวประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น" },
          { status: 400 }
        );
      }
      query.citizenId = sanitizedId;
    } else if (name) {
      // Support sub-string searches on name
      query.name = { $regex: name, $options: "i" };
    }

    const students = await db
      .collection("users")
      .find(query)
      .project({
        _id: 1,
        name: 1,
        citizenId: 1,
        academicLevel: 1,
        department: 1,
        classGroupId: 1,
        studentStatus: 1,
        learnerType: 1,
        email: 1,
        phone: 1,
        image: 1,
      })
      .limit(10) // Guard against database scraping
      .toArray();

    const maskedStudents = students.map((std: any) => ({
      id: std._id.toString(),
      name: std.name,
      citizenId: formatMaskedCitizenId(std.citizenId),
      academicLevel: std.academicLevel || "ไม่ระบุ",
      department: std.department || "ไม่ระบุ",
      classGroupId: std.classGroupId || "ไม่ระบุ",
      studentStatus: std.studentStatus || "กำลังศึกษา",
      learnerType: std.learnerType || "ทวิภาคี",
      phone: formatMaskedPhone(std.phone),
      email: formatMaskedEmail(std.email),
      image: std.image || null,
    }));

    return NextResponse.json({ success: true, students: maskedStudents });
  } catch (error: any) {
    console.error("[Student Verify API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
