import { ObjectId, Db } from "mongodb";

export interface TeacherFilterOptions {
  teacherId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}

export function normalizeDept(value: string) {
  if (!value) return "";
  // Remove "แผนกวิชา" or "แผนก" prefix and normalize
  let normalized = (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
  // Also handle case where "แผนกวิชา" is in the middle or end
  normalized = normalized.replace(/แผนกวิชา/g, "").trim();
  // Remove any remaining spaces
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized;
}

export async function getTeacherMetrics(db: Db, options: TeacherFilterOptions = {}) {
  const { teacherId, department, startDate, endDate } = options;

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

  // Get unique departments from all teachers before filtering (useful for dropdowns)
  const uniqueDepartments = Array.from(
    new Set(teachers.map((t) => t.department).filter(Boolean))
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
  const teacherNames = teachers.map((t) => t.name);

  // Parallel fetching of related data
  const [
    subjects,
    lessonPlans,
    plcRecords,
    dpaEvaluations,
    studentCares,
    supervisionRecords
  ] = await Promise.all([
    db.collection("dve_subjects").find({ teacherId: { $in: teacherIds } })
      .project({ _id: 1, teacherId: 1, name: 1, code: 1, department: 1, totalWeeks: 1, daysPerWeek: 1, hoursPerDay: 1 })
      .toArray(),
    db.collection("lesson_plans").find({ teacherName: { $in: teacherNames } }).toArray(),
    db.collection("plc_records").find({ participants: { $in: teacherNames } }).toArray(),
    db.collection("dpa_evaluations").find({ teacherName: { $in: teacherNames } }).toArray(),
    db.collection("student_care_records").find({ teacherName: { $in: teacherNames } }).toArray(),
    db.collection("supervision_records").find({ teacherName: { $in: teacherNames } }).toArray(),
  ]);

  const subjectIds = subjects.map((s) => s._id.toString());

  // Date filtering for attendances
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
      subjectId: { $in: subjectIds },
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    })
    .project({ _id: 1, subjectId: 1, studentId: 1, date: 1, score: 1, students: 1 })
    .toArray();

  return {
    teachers,
    uniqueDepartments,
    subjects,
    attendances,
    lessonPlans,
    plcRecords,
    dpaEvaluations,
    studentCares,
    supervisionRecords
  };
}
