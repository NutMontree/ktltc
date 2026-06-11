const fs = require('fs');

function updateVerificationAPI() {
  const file = 'd:\\ktltc\\src\\app\\api\\admin\\teacher-verification\\route.ts';
  let content = fs.readFileSync(file, 'utf8');

  // Insert querying the new collections
  content = content.replace(
    'const studentCares = await db.collection("student_care_records").find({ teacherName: { $in: teacherNames } }).toArray();',
    'const studentCares = await db.collection("student_care_records").find({ teacherName: { $in: teacherNames } }).toArray();\n    const supervisionRecords = await db.collection("supervision_records").find({ teacherName: { $in: teacherNames } }).toArray();'
  );

  const checklistInjection = `
      const teacherLessonPlans = lessonPlans.filter(lp => lp.teacherName === teacher.name);
      const checklist = {
        hasLessonPlan: teacherLessonPlans.length > 0,
        hasAfterClassNote: teacherLessonPlans.some(lp => lp.hasAfterClassNote),
        videoCount: teacherDpa?.videoUrls?.length || 0,
        hasStudentOutcome: (teacherDpa?.studentOutcomeUrls?.length || 0) > 0,
        evidenceLink: teacherDpa?.evidenceLinks?.[0] || null
      };
      
      const supervisions = supervisionRecords.filter(s => s.teacherName === teacher.name).map(s => ({
        score: s.score,
        maxScore: s.maxScore,
        date: s.supervisionDate
      }));
`;
  content = content.replace(
    'const hasStudentCare = studentCares.some(sc => sc.teacherName === teacher.name);',
    checklistInjection + '\n      const hasStudentCare = studentCares.some(sc => sc.teacherName === teacher.name);'
  );

  content = content.replace(
    'sdqCompletion,',
    'sdqCompletion,\n        checklist,\n        supervisions,'
  );

  fs.writeFileSync(file, content);
  console.log("Updated teacher-verification/route.ts");
}

try {
  updateVerificationAPI();
} catch (e) {
  console.error(e);
}
