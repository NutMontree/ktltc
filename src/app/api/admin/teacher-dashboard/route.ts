import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { getTeacherMetrics } from "@/lib/teacher";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const hasAccess = rolePerms?.permissions?.access_teacher_dashboard || userRole === "super_admin";

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

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

    // Fetch data using the centralized utility
    const metrics = await getTeacherMetrics(db, { department, startDate, endDate });

    // Get this week's attendances
    const thisWeekAttendances = metrics.attendances.filter((a) => {
      const attDate = new Date(a.date);
      return attDate >= startOfWeek && attDate <= endOfWeek;
    });

    // Get last week's attendances
    const lastWeekAttendances = metrics.attendances.filter((a) => {
      const attDate = new Date(a.date);
      return attDate >= startOfLastWeek && attDate <= endOfLastWeek;
    });

    // Calculate overall stats
    const totalTeachers = metrics.teachers.length;
    const activeTeachers = new Set(
      metrics.attendances.map((a) => {
        const subject = metrics.subjects.find((s) => s._id.toString() === a.subjectId);
        return subject?.teacherId;
      })
    ).size;
    const totalSubjects = metrics.subjects.length;
    const totalClasses = metrics.attendances.length;
    const totalStudents = metrics.attendances.reduce((sum, a) => sum + (a.students?.length || 0), 0);
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
    const thisWeekClasses = thisWeekAttendances.length;
    const lastWeekClasses = lastWeekAttendances.length;
    const weeklyGrowth = lastWeekClasses > 0 
      ? Math.round(((thisWeekClasses - lastWeekClasses) / lastWeekClasses) * 100) 
      : 0;

    // Calculate teacher activities
    const teacherActivities = metrics.teachers.map((teacher) => {
      const teacherIdStr = teacher._id.toString();
      const teacherSubjects = metrics.subjects.filter((s) => s.teacherId === teacherIdStr);
      const teacherSubjectIds = teacherSubjects.map((s) => s._id.toString());
      const teacherAttendances = metrics.attendances.filter((a) => teacherSubjectIds.includes(a.subjectId));
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
        if (lastActivity) {
          const lastActivityDate = new Date(lastActivity);
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          if (lastActivityDate >= fourteenDaysAgo) {
            status = "warning";
          }
        }
      }

      // Real Data calculation
      const lessonPlanSubmitted = metrics.lessonPlans.some(lp => lp.teacherName === teacher.name);
      const plcHours = metrics.plcRecords
        .filter(p => p.participants && p.participants.includes(teacher.name))
        .reduce((sum, p) => sum + (Number(p.durationHours) || 0), 0);
      
      const teacherDpa = metrics.dpaEvaluations.find(d => d.teacherName === teacher.name);
      const paStatus = teacherDpa && (teacherDpa.status === "evaluated" || teacherDpa.status === "approved") ? "approved" : "pending";
      
      const hasStudentCare = metrics.studentCares.some(sc => sc.teacherName === teacher.name);
      const sdqCompleted = hasStudentCare;
      
      const teachingHoursPerWeek = teacherSubjects.length > 0 
        ? teacherSubjects.reduce((sum, s) => sum + ((Number(s.daysPerWeek) || 1) * (Number(s.hoursPerDay) || 2)), 0)
        : 0;

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
        lessonPlanSubmitted,
        plcHours,
        paStatus,
        sdqCompleted,
        teachingHoursPerWeek
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
      departments: metrics.uniqueDepartments,
    });
  } catch (error: any) {
    console.error("[Admin Teacher Dashboard API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
