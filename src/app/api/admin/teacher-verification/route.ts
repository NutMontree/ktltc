import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin"];

function normalizeDept(value: string) {
  if (!value) return "";
  // Remove "แผนกวิชา" or "แผนก" prefix and normalize
  let normalized = (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
  // Also handle case where "แผนกวิชา" is in the middle or end
  normalized = normalized.replace(/แผนกวิชา/g, "").trim();
  // Remove any remaining spaces
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = ((session.user as any)?.role || "").toLowerCase();
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId")?.trim();
    const department = searchParams.get("department")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Build query for teachers
    const teacherQuery: any = { role: "teacher" };
    if (teacherId && ObjectId.isValid(teacherId)) {
      teacherQuery._id = new ObjectId(teacherId);
    }

    // Get teachers
    let teachers = await db
      .collection("users")
      .find(teacherQuery)
      .project({
        _id: 1,
        name: 1,
        email: 1,
        department: 1,
        image: 1,
        createdAt: 1,
      })
      .sort({ name: 1 })
      .toArray();

    console.log("[Teacher Verification] Total teachers found:", teachers.length);
    console.log("[Teacher Verification] All teachers departments:", teachers.map(t => t.department));

    // Get unique departments from teachers for the dropdown
    const uniqueDepartments = Array.from(
      new Set(teachers.map(t => t.department).filter(Boolean))
    ).sort();

    // Filter by department using normalized comparison for better matching
    if (department) {
      const normalizedFilter = normalizeDept(department);
      console.log("[Teacher Verification] Filter department:", department, "-> normalized:", normalizedFilter);
      
      teachers = teachers.filter((teacher) => {
        const normalizedTeacherDept = normalizeDept(teacher.department || "");
        console.log("[Teacher Verification] Teacher:", teacher.name, "department:", teacher.department, "-> normalized:", normalizedTeacherDept);
        
        // Check if the normalized department name contains the filter or vice versa
        const matches = normalizedTeacherDept.includes(normalizedFilter) || normalizedFilter.includes(normalizedTeacherDept);
        console.log("[Teacher Verification] Match result:", matches);
        return matches;
      });
      
      console.log("[Teacher Verification] Filtered teachers count:", teachers.length);
    }

    // Get DVE subjects for each teacher
    const teacherIds = teachers.map((t) => t._id.toString());
    const subjects = await db
      .collection("dve_subjects")
      .find({ teacherId: { $in: teacherIds } })
      .toArray();

    // Get attendance data for teaching activity verification
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = startDate;
    }
    if (endDate) {
      dateFilter.$lte = endDate;
    }

    const attendances = await db
      .collection("dve_attendances")
      .find({
        subjectId: { $in: subjects.map((s) => s._id.toString()) },
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      })
      .toArray();

    // Group data by teacher
    const teacherData = teachers.map((teacher) => {
      const teacherIdStr = teacher._id.toString();
      const teacherSubjects = subjects.filter((s) => s.teacherId === teacherIdStr);
      const subjectIds = teacherSubjects.map((s) => s._id.toString());
      const teacherAttendances = attendances.filter((a) => subjectIds.includes(a.subjectId));

      // Calculate teaching activity metrics
      const totalClasses = teacherAttendances.length;
      const uniqueDates = new Set(teacherAttendances.map((a) => a.date)).size;
      const totalStudents = teacherAttendances.reduce((sum, a) => sum + (a.students?.length || 0), 0);
      const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentAttendances = teacherAttendances.filter((a) => {
        const attDate = new Date(a.date);
        return attDate >= sevenDaysAgo;
      });

      return {
        id: teacherIdStr,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        image: teacher.image,
        createdAt: teacher.createdAt,
        subjects: teacherSubjects.map((s) => ({
          id: s._id.toString(),
          code: s.code,
          name: s.name,
          department: s.department,
          totalWeeks: s.totalWeeks,
          daysPerWeek: s.daysPerWeek,
          hoursPerDay: s.hoursPerDay,
        })),
        teachingActivity: {
          totalClasses,
          uniqueDates,
          totalStudents,
          avgStudentsPerClass,
          recentActivity: recentAttendances.length,
          lastTeachingDate: teacherAttendances.length > 0 
            ? teacherAttendances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
            : null,
        },
        isActive: totalClasses > 0,
      };
    });

    return NextResponse.json({
      success: true,
      teachers: teacherData,
      departments: uniqueDepartments,
    });
  } catch (error: any) {
    console.error("[Admin Teacher Verification API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
