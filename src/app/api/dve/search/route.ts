import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function toUserProfile(uDoc: any) {
  if (!uDoc) return null;
  return {
    id: uDoc._id.toString(),
    name: uDoc.name,
    role: uDoc.role,
    department: uDoc.department || "",
    studentId: uDoc.studentId || "",
    classGroupId: uDoc.classGroupId || "",
  };
}

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

function normalizeDept(value: string) {
  return (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
}

function resolveStudentDept(userProfile: any) {
  const dept = (userProfile?.department || "").trim();
  if (dept) return dept;
  return getDeptFromClassGroup(userProfile?.classGroupId || "");
}

function deptMatches(a: string, b: string) {
  const aa = normalizeDept(a);
  const bb = normalizeDept(b);
  return !!aa && !!bb && (aa.includes(bb) || bb.includes(aa));
}

function escapeRegex(text: string): string {
  return (text || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department")?.trim();
    const teacherId = searchParams.get("teacherId")?.trim();
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";
    const isStudent = userRole === "student";
    const isOwnerScoped = !isStudent;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let userProfile: any = null;
    if (userId && ObjectId.isValid(userId)) {
      const uDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      userProfile = toUserProfile(uDoc);
    }

    const studentDept = isStudent ? resolveStudentDept(userProfile) : "";

    if (!department && !teacherId) {
      if (isStudent) {
        const teachers = studentDept
          ? await db
              .collection("users")
              .find({ role: "teacher", department: { $regex: escapeRegex(studentDept), $options: "i" } })
              .project({ _id: 1, name: 1, department: 1 })
              .sort({ name: 1 })
              .toArray()
          : [];

        return NextResponse.json({
          success: true,
          departments: studentDept ? [studentDept] : [],
          teachers: teachers.map((t) => ({ id: t._id.toString(), name: t.name, department: t.department })),
          userProfile,
        });
      }

      const ownedSubjects = await db
        .collection("dve_subjects")
        .find({ teacherId: userId })
        .project({ department: 1 })
        .toArray();

      const departmentSet = new Set<string>();
      ownedSubjects.forEach((subject) => {
        if (subject.department) departmentSet.add(subject.department);
      });
      if (userProfile?.department) departmentSet.add(userProfile.department);

      return NextResponse.json({
        success: true,
        departments: Array.from(departmentSet),
        teachers: userProfile ? [{ id: userProfile.id, name: userProfile.name, department: userProfile.department }] : [],
        userProfile,
      });
    }

    if (department && !teacherId) {
      if (isStudent) {
        if (!studentDept || !deptMatches(department, studentDept)) {
          return NextResponse.json({
            success: true,
            teachers: [],
            subjects: [],
          });
        }

        const teachers = await db
          .collection("users")
          .find({ role: "teacher", department: { $regex: escapeRegex(studentDept), $options: "i" } })
          .project({ _id: 1, name: 1, department: 1 })
          .sort({ name: 1 })
          .toArray();

        const subjects = await db
          .collection("dve_subjects")
          .find({ department: { $regex: escapeRegex(studentDept), $options: "i" } })
          .sort({ name: 1 })
          .toArray();

        // Get teacher information to include teacher images
        const teacherIds = subjects.map((s) => s.teacherId).filter((id) => ObjectId.isValid(id));
        const subjectTeachers = teacherIds.length > 0
          ? await db.collection("users").find({ _id: { $in: teacherIds.map((id) => new ObjectId(id)) } }).toArray()
          : [];
        const teacherMap = new Map(subjectTeachers.map((t) => [t._id.toString(), t]));

        return NextResponse.json({
          success: true,
          teachers: teachers.map((t) => ({ id: t._id.toString(), name: t.name, department: t.department })),
          subjects: subjects.map((s) => {
            const teacher = teacherMap.get(s.teacherId);
            return {
              id: s._id.toString(),
              code: s.code,
              name: s.name,
              curriculum: s.curriculum,
              teacherId: s.teacherId,
              teacherName: s.teacherName,
              teacherImage: teacher?.image || "",
            };
          }),
        });
      }

      if (isOwnerScoped) {
        const subjects = await db
          .collection("dve_subjects")
          .find({ teacherId: userId, department: { $regex: escapeRegex(department), $options: "i" } })
          .sort({ name: 1 })
          .toArray();

        return NextResponse.json({
          success: true,
          teachers: userProfile ? [{ id: userProfile.id, name: userProfile.name, department: userProfile.department }] : [],
          subjects: subjects.map((s) => ({
            id: s._id.toString(),
            code: s.code,
            name: s.name,
            curriculum: s.curriculum,
            teacherId: s.teacherId,
            teacherName: s.teacherName,
            teacherImage: userProfile?.image || "",
          })),
        });
      }

      const subjects = await db
        .collection("dve_subjects")
        .find({ department: { $regex: escapeRegex(department), $options: "i" } })
        .sort({ name: 1 })
        .toArray();

      // Get teacher information to include teacher images
      const teacherIds = subjects.map((s) => s.teacherId).filter((id) => ObjectId.isValid(id));
      const subjectTeachers = teacherIds.length > 0
        ? await db.collection("users").find({ _id: { $in: teacherIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
      const teacherMap = new Map(subjectTeachers.map((t) => [t._id.toString(), t]));

      const deptTeachers = await db
        .collection("users")
        .find({ role: "teacher", department: { $regex: escapeRegex(department), $options: "i" } })
        .project({ _id: 1, name: 1, department: 1 })
        .toArray();

      const teacherIdsFromSubjects = subjects
        .map((s) => s.teacherId)
        .filter((id): id is string => typeof id === "string");

      const subjectTeacherObjectIds = teacherIdsFromSubjects
        .map((id) => {
          try {
            return new ObjectId(id);
          } catch {
            return null;
          }
        })
        .filter((id): id is ObjectId => id !== null);

      const subjectTeachersList =
        subjectTeacherObjectIds.length > 0
          ? await db
              .collection("users")
              .find({ role: "teacher", _id: { $in: subjectTeacherObjectIds } })
              .project({ _id: 1, name: 1, department: 1 })
              .toArray()
          : [];

      const uniqueTeachersMap = new Map<string, any>();
      deptTeachers.forEach((t) => uniqueTeachersMap.set(t._id.toString(), t));
      subjectTeachersList.forEach((t) => uniqueTeachersMap.set(t._id.toString(), t));

      const teachersList = Array.from(uniqueTeachersMap.values()).sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );

      return NextResponse.json({
        success: true,
        teachers: teachersList.map((t) => ({ id: t._id.toString(), name: t.name, department: t.department })),
        subjects: subjects.map((s) => {
          const teacher = teacherMap.get(s.teacherId);
          return {
            id: s._id.toString(),
            code: s.code,
            name: s.name,
            curriculum: s.curriculum,
            teacherId: s.teacherId,
            teacherName: s.teacherName,
            teacherImage: teacher?.image || "",
          };
        }),
      });
    }

    if (teacherId) {
      if (isStudent) {
        if (!studentDept || !ObjectId.isValid(teacherId)) {
          return NextResponse.json({ success: true, subjects: [] });
        }

        const teacher = await db.collection("users").findOne({
          _id: new ObjectId(teacherId),
          role: "teacher",
          department: { $regex: escapeRegex(studentDept), $options: "i" },
        });
        if (!teacher) {
          return NextResponse.json({ success: true, subjects: [] });
        }

        const subjects = await db
          .collection("dve_subjects")
          .find({ teacherId, department: { $regex: escapeRegex(studentDept), $options: "i" } })
          .sort({ name: 1 })
          .toArray();

        return NextResponse.json({
          success: true,
          subjects: subjects.map((s) => ({
            id: s._id.toString(),
            code: s.code,
            name: s.name,
            curriculum: s.curriculum,
            department: s.department,
            teacherId: s.teacherId,
            teacherName: s.teacherName,
          })),
        });
      }

      if (isOwnerScoped) {
        if (teacherId !== userId) {
          return NextResponse.json({ success: true, subjects: [] });
        }

        const subjects = await db
          .collection("dve_subjects")
          .find({ teacherId: userId })
          .sort({ name: 1 })
          .toArray();

        return NextResponse.json({
          success: true,
          subjects: subjects.map((s) => ({
            id: s._id.toString(),
            code: s.code,
            name: s.name,
            curriculum: s.curriculum,
            department: s.department,
            teacherId: s.teacherId,
            teacherName: s.teacherName,
          })),
        });
      }

      const subjects = await db
        .collection("dve_subjects")
        .find({ teacherId })
        .sort({ name: 1 })
        .toArray();

      return NextResponse.json({
        success: true,
        subjects: subjects.map((s) => ({
          id: s._id.toString(),
          code: s.code,
          name: s.name,
          curriculum: s.curriculum,
          department: s.department,
          teacherId: s.teacherId,
          teacherName: s.teacherName,
        })),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("[DVE Search API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
