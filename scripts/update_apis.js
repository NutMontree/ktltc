const fs = require('fs');

function updateDashboardAPI() {
  const file = 'd:\\ktltc\\src\\app\\api\\admin\\teacher-dashboard\\route.ts';
  let content = fs.readFileSync(file, 'utf8');

  // Insert querying the new collections before teacherActivities mapping
  const queryInjection = `
    const teacherNames = teachers.map((t) => t.name);

    // Fetch real metrics from collections
    const lessonPlans = await db.collection("lesson_plans").find({ teacherName: { $in: teacherNames } }).toArray();
    const plcRecords = await db.collection("plc_records").find({ participants: { $in: teacherNames } }).toArray();
    const dpaEvaluations = await db.collection("dpa_evaluations").find({ teacherName: { $in: teacherNames } }).toArray();
    const studentCares = await db.collection("student_care_records").find({ teacherName: { $in: teacherNames } }).toArray();

    // Calculate teacher activities
`;
  content = content.replace('    // Calculate teacher activities', queryInjection);

  const mapInjection = `
      // Real Data calculation
      const lessonPlanSubmitted = lessonPlans.some(lp => lp.teacherName === teacher.name);
      const plcHours = plcRecords
        .filter(p => p.participants && p.participants.includes(teacher.name))
        .reduce((sum, p) => sum + (Number(p.durationHours) || 0), 0);
      
      const teacherDpa = dpaEvaluations.find(d => d.teacherName === teacher.name);
      const paStatus = teacherDpa && (teacherDpa.status === "evaluated" || teacherDpa.status === "approved") ? "approved" : "pending";
      
      const hasStudentCare = studentCares.some(sc => sc.teacherName === teacher.name);
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
`;

  // Replace the return inside map
  content = content.replace(/      return \{\s+teacherId[\s\S]*?image: teacher.image,\s+\};\s+\}\);/, mapInjection + '    });');

  fs.writeFileSync(file, content);
  console.log("Updated teacher-dashboard/route.ts");
}

function updateVerificationAPI() {
  const file = 'd:\\ktltc\\src\\app\\api\\admin\\teacher-verification\\route.ts';
  let content = fs.readFileSync(file, 'utf8');

  // Insert querying the new collections
  const queryInjection = `
    const teacherNames = teachers.map((t) => t.name);

    // Fetch real metrics from collections
    const lessonPlans = await db.collection("lesson_plans").find({ teacherName: { $in: teacherNames } }).toArray();
    const plcRecords = await db.collection("plc_records").find({ participants: { $in: teacherNames } }).toArray();
    const dpaEvaluations = await db.collection("dpa_evaluations").find({ teacherName: { $in: teacherNames } }).toArray();
    const studentCares = await db.collection("student_care_records").find({ teacherName: { $in: teacherNames } }).toArray();

    // Group data by teacher
`;
  content = content.replace('    // Group data by teacher', queryInjection);

  const mapInjection = `
      // Real Data calculation
      const lessonPlanStatus = lessonPlans.some(lp => lp.teacherName === teacher.name) ? "submitted" : "missing";
      const plcHours = plcRecords
        .filter(p => p.participants && p.participants.includes(teacher.name))
        .reduce((sum, p) => sum + (Number(p.durationHours) || 0), 0);
      
      const teacherDpa = dpaEvaluations.find(d => d.teacherName === teacher.name);
      const paStatus = teacherDpa && (teacherDpa.status === "evaluated" || teacherDpa.status === "approved") ? "approved" : "pending";
      
      const hasStudentCare = studentCares.some(sc => sc.teacherName === teacher.name);
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
        teachingHours
      };
`;

  // Replace the return inside map
  content = content.replace(/      return \{\s+id: teacherIdStr,[\s\S]*?isActive: totalClasses > 0,\s+\};\s+\}\);/, mapInjection + '    });');

  fs.writeFileSync(file, content);
  console.log("Updated teacher-verification/route.ts");
}

try {
  updateDashboardAPI();
  updateVerificationAPI();
} catch (e) {
  console.error(e);
}
