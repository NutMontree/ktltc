import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getDeptFromClassGroup(classGroupId: string): string {
  if (!classGroupId) return "แผนกวิชาสามัญสัมพันธ์";
  const clean = classGroupId.replace(/[^0-9a-zA-Zก-ฮ]/g, "").trim();
  
  // Checking prefixes
  if (clean.startsWith("ชย") || clean.startsWith("ชยธ")) return "แผนกวิชาช่างยนต์";
  if (clean.startsWith("ชฟ") || clean.startsWith("สชฟ")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.startsWith("ชอ") || clean.startsWith("สชอ")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.startsWith("บช")) return "แผนกวิชาการบัญชี";
  if (clean.startsWith("ตล")) return "แผนกวิชาการตลาด";
  if (clean.startsWith("รแ") || clean.startsWith("กร") || clean.startsWith("ก.ร")) return "แผนกวิชาการโรงแรม";
  
  // Checking middle course codes
  if (clean.includes("30101") || clean.includes("20101")) return "แผนกวิชาช่างยนต์";
  if (clean.includes("30102") || clean.includes("20102")) return "แผนกวิชาช่างกลโรงงาน";
  if (clean.includes("30103") || clean.includes("20103")) return "แผนกวิชาช่างเชื่อมโลหะ";
  if (clean.includes("30104") || clean.includes("20104")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.includes("30105") || clean.includes("20105")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.includes("30120") || clean.includes("30121") || clean.includes("20120") || clean.includes("20121")) return "แผนกวิชาช่างก่อสร้าง";
  if (clean.includes("30201") || clean.includes("20201")) return "แผนกวิชาการบัญชี";
  if (clean.includes("30202") || clean.includes("20202")) return "แผนกวิชาการตลาด";
  if (clean.includes("30701") || clean.includes("20701")) return "แผนกวิชาการโรงแรม";
  
  if (
    clean.includes("31910") || clean.includes("31911") || 
    clean.includes("21910") || clean.includes("21911") ||
    clean.includes("31905") || clean.includes("31901") ||
    clean.includes("31401") || clean.includes("21919") ||
    clean.includes("69219") || clean.includes("68219") ||
    clean.includes("69319") || clean.includes("69314") ||
    clean.includes("62127")
  ) {
    return "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
  }

  // Fallback
  return "แผนกวิชาสามัญสัมพันธ์";
}

export async function GET() {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();
    
    // Auth Guard: Only super_admin, admin, or editor can trigger
    const allowed = ["super_admin", "admin", "editor"];
    if (!session || !allowed.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Find all students
    const students = await db.collection("users").find({ role: "student" }).toArray();
    
    let updatedCount = 0;
    const updates = [];

    for (const student of students) {
      const currentDept = student.department || "";
      const classGroup = student.classGroupId || "";
      
      // If student is in placeholder or generic department, map them to real academic departments
      const isPlaceholder = 
        !currentDept || 
        currentDept === "ไม่มีสังกัด" || 
        currentDept.includes("แผนกนักเรียน") || 
        currentDept.includes("นักเรียน/นักศึกษา");

      if (isPlaceholder && classGroup) {
        const targetDept = getDeptFromClassGroup(classGroup);
        updates.push({
          updateOne: {
            filter: { _id: student._id },
            update: { $set: { department: targetDept, updatedAt: new Date() } }
          }
        });
        updatedCount++;
      }
    }

    if (updates.length > 0) {
      await db.collection("users").bulkWrite(updates);
    }

    return NextResponse.json({
      success: true,
      totalStudentsExamined: students.length,
      totalUpdated: updatedCount,
      message: `สำเร็จ! ย้ายและจัดกลุ่มนักเรียน ${updatedCount} คนเข้าสู่แผนกวิชาจริงตามกลุ่มเรียนเรียบร้อยแล้ว`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
