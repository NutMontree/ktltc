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
    const hasAccess = rolePerms?.permissions?.access_teacher_verification || userRole === "super_admin";

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId")?.trim();
    const department = searchParams.get("department")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

    // Fetch data using centralized utility
    const metrics = await getTeacherMetrics(db, { teacherId, department, startDate, endDate });

    // Group data by teacher
    const teacherData = metrics.teachers.map((teacher) => {
      const teacherIdStr = teacher._id.toString();
      const teacherSubjects = metrics.subjects.filter((s) => s.teacherId === teacherIdStr);
      const subjectIds = teacherSubjects.map((s) => s._id.toString());
      const teacherAttendances = metrics.attendances.filter((a) => subjectIds.includes(a.subjectId));

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

      // Real Data calculation
      const lessonPlanStatus = metrics.lessonPlans.some(lp => lp.teacherName === teacher.name) ? "submitted" : "missing";
      const plcHours = metrics.plcRecords
        .filter(p => p.participants && p.participants.includes(teacher.name))
        .reduce((sum, p) => sum + (Number(p.durationHours) || 0), 0);
      
      const teacherDpa = metrics.dpaEvaluations.find(d => d.teacherName === teacher.name);
      const paStatus = teacherDpa && (teacherDpa.status === "evaluated" || teacherDpa.status === "approved") ? "approved" : "pending";
      
      const teacherLessonPlans = metrics.lessonPlans.filter(lp => lp.teacherName === teacher.name);
      const checklist = {
        hasLessonPlan: teacherLessonPlans.length > 0,
        hasAfterClassNote: teacherLessonPlans.some(lp => lp.hasAfterClassNote),
        videoCount: teacherDpa?.videoUrls?.length || 0,
        hasStudentOutcome: (teacherDpa?.studentOutcomeUrls?.length || 0) > 0,
        evidenceLink: teacherDpa?.evidenceLinks?.[0] || null
      };
      
      const supervisions = metrics.supervisionRecords.filter(s => s.teacherName === teacher.name).map(s => ({
        score: s.score,
        maxScore: s.maxScore,
        date: s.supervisionDate
      }));

      const hasStudentCare = metrics.studentCares.some(sc => sc.teacherName === teacher.name);
      const sdqCompletion = hasStudentCare ? 100 : 0;
      
      const teachingHours = teacherSubjects.length > 0 
        ? teacherSubjects.reduce((sum, s) => sum + ((Number(s.daysPerWeek) || 1) * (Number(s.hoursPerDay) || 2)), 0)
        : 0;

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
        lessonPlanStatus,
        plcHours,
        paStatus,
        sdqCompletion,
        checklist,
        supervisions,
        teachingHours
      };
    });

    return NextResponse.json({
      success: true,
      teachers: teacherData,
      departments: metrics.uniqueDepartments,
    });
  } catch (error: any) {
    console.error("[Admin Teacher Verification API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
