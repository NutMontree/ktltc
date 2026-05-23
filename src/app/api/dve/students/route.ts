import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

function getDeptFromClassGroup(classGroupId: string): string {
  if (!classGroupId) return "";
  const clean = classGroupId.replace(/[^0-9a-zA-Zก-ฮ]/g, "").trim();

  if (clean.startsWith("ชย") || clean.startsWith("ชยธ")) return "แผนกวิชาช่างยนต์";
  if (clean.startsWith("ชฟ") || clean.startsWith("สชฟ")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.startsWith("ชอ") || clean.startsWith("สชอ")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.startsWith("บช")) return "แผนกวิชาการบัญชี";
  if (clean.startsWith("ตล")) return "แผนกวิชาการตลาด";
  if (clean.startsWith("รแ") || clean.startsWith("กร") || clean.startsWith("ก.ร")) return "แผนกวิชาการโรงแรม";

  if (clean.includes("30101") || clean.includes("20101")) return "แผนกวิชาช่างยนต์";
  if (clean.includes("30102") || clean.includes("20102")) return "แผนกวิชากลโรงงาน";
  if (clean.includes("30103") || clean.includes("20103")) return "แผนกวิชาช่างเชื่อมโลหะ";
  if (clean.includes("30104") || clean.includes("20104")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.includes("30105") || clean.includes("20105")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.includes("30120") || clean.includes("30121") || clean.includes("20120") || clean.includes("20121")) return "แผนกวิชาก่อสร้าง";
  if (clean.includes("30201") || clean.includes("20201")) return "แผนกวิชาการบัญชี";
  if (clean.includes("30202") || clean.includes("20202")) return "แผนกวิชาการตลาด";
  if (clean.includes("30701") || clean.includes("20701")) return "แผนกวิชาการโรงแรม";

  if (
    clean.includes("31910") ||
    clean.includes("31911") ||
    clean.includes("21910") ||
    clean.includes("21911") ||
    clean.includes("31905") ||
    clean.includes("31901") ||
    clean.includes("31401") ||
    clean.includes("21919") ||
    clean.includes("69219") ||
    clean.includes("68219") ||
    clean.includes("69319") ||
    clean.includes("69314") ||
    clean.includes("62127")
  ) {
    return "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
  }

  return "";
}

function normalizeDept(dept: string): string {
  return (dept || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
}

function escapeRegex(text: string): string {
  return (text || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

async function resolveStudentDoc(db: any, userId: string) {
  if (!ObjectId.isValid(userId)) return null;
  return db.collection("users").findOne({ _id: new ObjectId(userId), role: "student" });
}

async function isOwnedSubject(db: any, subjectId: string, userId: string) {
  if (!ObjectId.isValid(subjectId)) return false;
  const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
  return !!subject && subject.teacherId === userId;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department")?.trim() || "";
    const classGroupId = searchParams.get("classGroupId")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    if (userRole === "student") {
      const studentDoc = await resolveStudentDoc(db, userId);
      if (!studentDoc) {
        return NextResponse.json({ success: true, students: [], classGroups: [] });
      }

      const ownDept = (studentDoc.department || "").trim() || getDeptFromClassGroup(studentDoc.classGroupId || "");
      const ownClean = normalizeDept(ownDept);
      const requestedClean = normalizeDept(department || ownDept);
      if (ownClean && requestedClean && !ownClean.includes(requestedClean) && !requestedClean.includes(ownClean)) {
        return NextResponse.json({ success: true, students: [], classGroups: [] });
      }

      const ownStudent = {
        id: studentDoc._id.toString(),
        name: studentDoc.name || "ไม่ระบุชื่อ",
        studentIdNum: studentDoc.studentId || "ไม่ระบุรหัส",
        classGroupId: studentDoc.classGroupId || "ไม่ระบุกลุ่ม",
        department: studentDoc.department || ownDept,
        image: studentDoc.image || null,
        isInternship: studentDoc.isInternship ?? false,
      };

      return NextResponse.json({
        success: true,
        students: [ownStudent],
        classGroups: classGroupId ? [classGroupId] : [studentDoc.classGroupId || ""].filter(Boolean),
      });
    }

    const role = userRole;
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!department) {
      return NextResponse.json({ error: "Missing department parameter" }, { status: 400 });
    }

    const ownedSubject = await db.collection("dve_subjects").findOne({
      teacherId: userId,
      department: { $regex: escapeRegex(department), $options: "i" },
    });
    if (!ownedSubject) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query: any = { role: "student" };
    if (classGroupId) {
      query.classGroupId = { $regex: escapeRegex(classGroupId), $options: "i" };
    }

    const students = await db
      .collection("users")
      .find(query)
      .project({ _id: 1, name: 1, studentId: 1, classGroupId: 1, department: 1, image: 1, isInternship: 1 })
      .sort({ studentId: 1, name: 1 })
      .toArray();

    const targetClean = normalizeDept(department);
    const filteredStudents = students.filter((s) => {
      const currentDept = s.department || "";
      const classGroup = s.classGroupId || "";

      const isPlaceholder =
        !currentDept ||
        currentDept === "ไม่มีกำหนด" ||
        currentDept.includes("แผนกนักเรียน") ||
        currentDept.includes("นักเรียน/นักศึกษา");

      let finalDept = currentDept;
      if (isPlaceholder && classGroup) {
        finalDept = getDeptFromClassGroup(classGroup);
      }

      const finalClean = normalizeDept(finalDept);
      return finalClean.includes(targetClean) || targetClean.includes(finalClean);
    });

    const allStudents = await db.collection("users").find({ role: "student" }).toArray();
    const distinctClassGroups = Array.from(
      new Set(
        allStudents
          .filter((s) => {
            const currentDept = s.department || "";
            const classGroup = s.classGroupId || "";
            let finalDept = currentDept;
            if ((!currentDept || currentDept === "ไม่มีกำหนด" || currentDept.includes("แผนกนักเรียน") || currentDept.includes("นักเรียน/นักศึกษา")) && classGroup) {
              finalDept = getDeptFromClassGroup(classGroup);
            }
            const finalClean = normalizeDept(finalDept);
            return finalClean.includes(targetClean) || targetClean.includes(finalClean);
          })
          .map((s) => s.classGroupId)
          .filter(Boolean),
      ),
    ).sort();

    return NextResponse.json({
      success: true,
      students: filteredStudents.map((s) => ({
        id: s._id.toString(),
        name: s.name || "ไม่ระบุชื่อ",
        studentIdNum: s.studentId || "ไม่ระบุรหัส",
        classGroupId: s.classGroupId || "ไม่ระบุห้อง",
        department: s.department || department,
        image: s.image || null,
        isInternship: s.isInternship ?? false,
      })),
      classGroups: distinctClassGroups,
    });
  } catch (error: any) {
    console.error("[DVE Students Fetch API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, isInternship } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId parameter" }, { status: 400 });
    }

    if (!ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid studentId format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(studentId), role: "student" },
      { $set: { isInternship: !!isInternship } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "อัปเดตสถานะการฝึกงานเรียบร้อยแล้ว" });
  } catch (error: any) {
    console.error("[DVE Students Update API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
