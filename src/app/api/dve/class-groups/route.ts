import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];
const CLASS_GROUP_FIELDS = ["classGroupId", "groupCode", "classroomName"] as const;

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
  if (clean.includes("30120") || clean.includes("30121") || clean.includes("20120") || clean.includes("20121")) {
    return "แผนกวิชาก่อสร้าง";
  }
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

function normalizeDept(value: string): string {
  return String(value || "")
    .replace(/^(แผนกวิชา|แผนก)/, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

function standardizeClassGroupName(name: string): string {
  if (!name) return "";
  const clean = String(name).trim();
  const stripped = clean.replace(/[\s.-]+/g, "");
  const match = stripped.match(/^([ก-ฮa-zA-Z]+)(.*)$/);
  if (match) {
    const prefix = match[1];
    const rest = match[2];
    return rest ? `${prefix}.${rest}` : prefix;
  }
  return clean;
}

function resolveStudentClassGroup(student: any): string {
  for (const field of CLASS_GROUP_FIELDS) {
    const value = student?.[field];
    if (value && String(value).trim()) {
      return standardizeClassGroupName(String(value));
    }
  }
  return "";
}

function departmentMatches(requestedDepartments: string[], studentDept: string): boolean {
  const normalizedStudentDept = normalizeDept(studentDept);
  if (!normalizedStudentDept) return false;

  return requestedDepartments.some((dept) => {
    const normalizedRequestedDept = normalizeDept(dept);
    return (
      !!normalizedRequestedDept &&
      (normalizedStudentDept.includes(normalizedRequestedDept) ||
        normalizedRequestedDept.includes(normalizedStudentDept))
    );
  });
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = ((session.user as any)?.role || "").toLowerCase();
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const requestedDepartments = (searchParams.get("department") || "")
      .split(",")
      .map((dept) => dept.trim())
      .filter(Boolean);

    if (requestedDepartments.length === 0) {
      return NextResponse.json({ success: true, classGroups: [] });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const students = await db
      .collection("users")
      .find({ role: "student" })
      .project({
        _id: 0,
        department: 1,
        classGroupId: 1,
        groupCode: 1,
        classroomName: 1,
      })
      .toArray();

    const classGroups = Array.from(
      new Set(
        students
          .map((student) => {
            const classGroup = resolveStudentClassGroup(student);
            const department = (student.department || "").trim() || getDeptFromClassGroup(classGroup);
            return { classGroup, department };
          })
          .filter((student) => departmentMatches(requestedDepartments, student.department))
          .map((student) => student.classGroup)
          .filter((group) => group && !/^[\d\s-]+$/.test(group)),
      ),
    ).sort((a, b) => a.localeCompare(b, "th"));

    return NextResponse.json({ success: true, classGroups });
  } catch (error) {
    console.error("[DVE Class Groups API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
