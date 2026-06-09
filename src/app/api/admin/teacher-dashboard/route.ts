import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

const ALLOWED_ROLES = ["super_admin", "admin"];

function normalizeDept(value: string) {
  if (!value) return "";
  // Remove "แผนกวิชา" or "แผนก" prefix and normalize
  let normalized = (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
  // Also handle case where "แผนกวิชา" is in the middle or end
  normalized = normalized.replace(/แผนกวิชา/g, "").trim();
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
    const department = searchParams.get("department")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Get date ranges for this week and last week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfWeek.getDate() - 7);

    // Build query for teachers
    const teacherQuery: any = { role: "teacher" };

    // Get teachers
    let teachers = await db
      .collection("users")
      .find(teacherQuery)
      .project({
        _id: 1,
        name: 1,
        department: 1,
        image: 1,
      })
      .toArray();

    // Get unique departments from teachers for the dropdown
    const uniqueDepartments = Array.from(
      new Set(teachers.map(t => t.department).filter(Boolean))
    ).sort();

    // Filter by department using normalized comparison for better matching
    if (department) {
      const normalizedFilter = normalizeDept(department);
      teachers = teachers.filter((teacher) => {
        const normalizedTeacherDept = normalizeDept(teacher.department || "");
        // Check if the normalized department name contains the filter or vice versa
        return normalizedTeacherDept.includes(normalizedFilter) || normalizedFilter.includes(normalizedTeacherDept);
      });
    }

    const teacherIds = teachers.map((t) => t._id.toString());

    // Get DVE subjects first (needed for attendances query)
    const subjects = await db
      .collection("dve_subjects")
      .find({ teacherId: { $in: teacherIds } })
      .project({ _id: 1, teacherId: 1, name: 1, code: 1, department: 1 })
      .toArray();

    const subjectIds = subjects.map((s) => s._id.toString());

    // Build date filter for attendances
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = startDate;
    }
    if (endDate) {
      dateFilter.$lte = endDate;
    }

    // Get attendances
    const attendances = await db
      .collection("dve_attendances")
      .find({
        subjectId: { $in: subjectIds },
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      })
      .project({ _id: 1, subjectId: 1, studentId: 1, date: 1, score: 1 })
      .toArray();

    // Get this week's attendances
    const thisWeekAttendances = attendances.filter((a) => {
      const attDate = new Date(a.date);
      return attDate >= startOfWeek && attDate <= endOfWeek;
    });

    // Get last week's attendances
    const lastWeekAttendances = attendances.filter((a) => {
      const attDate = new Date(a.date);
      return attDate >= startOfLastWeek && attDate <= endOfLastWeek;
    });

    // Calculate overall stats
    const totalTeachers = teachers.length;
    const activeTeachers = new Set(
      attendances.map((a) => {
        const subject = subjects.find((s) => s._id.toString() === a.subjectId);
        return subject?.teacherId;
      })
    ).size;
    const totalSubjects = subjects.length;
    const totalClasses = attendances.length;
    const totalStudents = attendances.reduce((sum, a) => sum + (a.students?.length || 0), 0);
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
    const thisWeekClasses = thisWeekAttendances.length;
    const lastWeekClasses = lastWeekAttendances.length;
    const weeklyGrowth = lastWeekClasses > 0 
      ? Math.round(((thisWeekClasses - lastWeekClasses) / lastWeekClasses) * 100) 
      : 0;

    // Calculate teacher activities
    const teacherActivities = teachers.map((teacher) => {
      const teacherIdStr = teacher._id.toString();
      const teacherSubjects = subjects.filter((s) => s.teacherId === teacherIdStr);
      const teacherSubjectIds = teacherSubjects.map((s) => s._id.toString());
      const teacherAttendances = attendances.filter((a) => teacherSubjectIds.includes(a.subjectId));
      const teacherThisWeekAttendances = thisWeekAttendances.filter((a) => teacherSubjectIds.includes(a.subjectId));

      const totalClassesCount = teacherAttendances.length;
      const thisWeekClassesCount = teacherThisWeekAttendances.length;
      const totalStudentsCount = teacherAttendances.reduce((sum, a) => sum + (a.students?.length || 0), 0);
      const lastActivity = teacherAttendances.length > 0
        ? teacherAttendances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;

      // Determine status
      let status: "active" | "inactive" | "warning" = "inactive";
      if (thisWeekClassesCount > 0) {
        status = "active";
      } else if (totalClassesCount > 0) {
        // Check if last activity was within last 14 days
        if (lastActivity) {
          const lastActivityDate = new Date(lastActivity);
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          if (lastActivityDate >= fourteenDaysAgo) {
            status = "warning";
          }
        }
      }

      return {
        teacherId: teacherIdStr,
        teacherName: teacher.name,
        department: teacher.department,
        totalClasses: totalClassesCount,
        thisWeekClasses: thisWeekClassesCount,
        totalStudents: totalStudentsCount,
        lastActivity: lastActivity,
        subjects: teacherSubjects.length,
        status,
        image: teacher.image,
      };
    });

    // Sort by activity (most active first)
    teacherActivities.sort((a, b) => b.thisWeekClasses - a.thisWeekClasses);

    return NextResponse.json({
      success: true,
      stats: {
        totalTeachers,
        activeTeachers,
        totalSubjects,
        totalClasses,
        totalStudents,
        avgStudentsPerClass,
        thisWeekClasses,
        lastWeekClasses,
        weeklyGrowth,
      },
      activities: teacherActivities,
      departments: uniqueDepartments,
    });
  } catch (error: any) {
    console.error("[Admin Teacher Dashboard API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
