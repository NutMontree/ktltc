import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher", "director", "deputy_academic"];

const CLASS_GROUP_FIELDS = ["classGroupId", "groupCode", "classroomName"] as const;

function standardizeClassGroupName(name: string): string {
  if (!name) return "";
  let clean = name.trim();
  const stripped = clean.replace(/[\s\.-]+/g, "");
  const match = stripped.match(/^([ก-ฮa-zA-Z]+)(.*)$/);
  if (match) {
    const prefix = match[1];
    const rest = match[2];
    if (rest) {
      return `${prefix}.${rest}`;
    }
    return prefix;
  }
  return stripped;
}

function resolveStudentClassGroup(student: any): string {
  if (!student) return "";
  for (const field of CLASS_GROUP_FIELDS) {
    const value = student[field];
    if (value && String(value).trim()) {
      return standardizeClassGroupName(String(value).trim());
    }
  }
  return "";
}

function parseAllowedClassGroups(value: any): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => standardizeClassGroupName(String(item || "").trim()))
          .filter(Boolean),
      ),
    );
  }
  if (typeof value === "string") {
    return Array.from(
      new Set(
        value
          .split(",")
          .map((item) => standardizeClassGroupName(item))
          .filter(Boolean),
      ),
    );
  }
  return [];
}

// Default grading configuration
const DEFAULT_GRADING_CONFIG = {
  categories: [
    {
      id: "mental_health",
      name: "จิตพิสัย",
      points: 20,
      cannotDeduct: true,
      required: true,
      description: "การประเมินจิตพิสัยและความประพฤติ",
    },
    {
      id: "class_work",
      name: "ระหว่างเรียน",
      points: 20,
      cannotDeduct: false,
      required: false,
      description: "คะแนนเก็บระหว่างเรียน",
    },
    {
      id: "midterm_exam",
      name: "กลางภาค",
      points: 10,
      cannotDeduct: true,
      required: true,
      description: "การสอบกลางภาค",
    },
    {
      id: "end_of_chapter_exam",
      name: "เก็บท้ายบท",
      points: 20,
      cannotDeduct: true,
      required: true,
      description: "การสอบท้ายบท",
    },
    {
      id: "project",
      name: "โปรเจครายวิชา",
      points: 10,
      cannotDeduct: false,
      required: false,
      description: "โปรเจครายวิชา",
    },
    {
      id: "final_exam",
      name: "ปลายภาค",
      points: 20,
      cannotDeduct: true,
      required: true,
      description: "การสอบปลายภาค",
    },
  ],
  totalPoints: 100,
  passingScore: 50,
  gradeScale: [
    { minScore: 80, grade: "4.0", description: "ดีเยี่ยม" },
    { minScore: 75, grade: "3.5", description: "ดีมาก" },
    { minScore: 70, grade: "3.0", description: "ดี" },
    { minScore: 65, grade: "2.5", description: "ค่อนข้างดี" },
    { minScore: 60, grade: "2.0", description: "พอใช้" },
    { minScore: 55, grade: "1.5", description: "ผ่านเกณฑ์ขั้นต่ำ" },
    { minScore: 50, grade: "1.0", description: "ผ่านเกณฑ์ปรับปรุง" },
    { minScore: 0, grade: "0", description: "ต่ำกว่าเกณฑ์ / ไม่ผ่าน" },
  ],
};

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId")?.trim();
    const studentId = searchParams.get("studentId")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    if (!subjectId) {
      return NextResponse.json({ error: "Missing subjectId" }, { status: 400 });
    }

    // Check if user has access to this subject
    const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (userRole === "teacher" && subject.teacherId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get grading config for this subject
    let config: any = await db.collection("dve_grading_configs").findOne({ subjectId });
    if (!config) {
      config = DEFAULT_GRADING_CONFIG;
    }

    // Build query for student grades
    const query: any = { subjectId };
    if (studentId) {
      query.studentId = studentId;
    }

    // 1. Get students who have grades
    const grades = await db
      .collection("dve_student_grades")
      .find(query)
      .toArray();

    // 2. Get students who have submitted work / quizzes (they have a numeric score in attendances)
    const attendancesWithScores = await db
      .collection("dve_attendances")
      .find({
        ...query,
        score: { $exists: true, $nin: ["", null] }
      })
      .project({ studentId: 1, studentName: 1, score: 1, maxScore: 1, unitTitle: 1 })
      .toArray();

    // Group scores by inferred category
    const autoScoresMap = new Map(); // studentId -> { class_work: { s: 0, m: 0 }, midterm: { s: 0, m: 0 }, final: { s: 0, m: 0 }, end_chapter: { s: 0, m: 0 } }
    
    attendancesWithScores.forEach((a: any) => {
      const s = Number(a.score);
      const m = Number(a.maxScore) || s || 10; // Fallback max score if missing
      const title = (a.unitTitle || "").toLowerCase();
      
      // Exclude Pre-tests from auto-grading
      if (title.includes("ก่อนเรียน") || title.includes("pre-test")) {
        return; 
      }

      let catType = "class_work";
      if (title.includes("กลางภาค") || title.includes("midterm")) {
        catType = "midterm";
      } else if (title.includes("ปลายภาค") || title.includes("final")) {
        catType = "final";
      } else if (title.includes("สอบท้ายบท") || title.includes("หลังเรียน") || title.includes("post-test")) {
        catType = "end_chapter";
      }

      if (!isNaN(s) && a.studentId) {
        if (!autoScoresMap.has(a.studentId)) {
          autoScoresMap.set(a.studentId, { class_work: { s: 0, m: 0 }, midterm: { s: 0, m: 0 }, final: { s: 0, m: 0 }, end_chapter: { s: 0, m: 0 } });
        }
        const studentScores = autoScoresMap.get(a.studentId);
        studentScores[catType].s += s;
        studentScores[catType].m += m;
      }
    });

    const studentMap = new Map();

    // Add students from explicit grades
    grades.forEach((g: any) => {
      const mapKey = g.studentId || `manual_${g._id.toString()}`;
      studentMap.set(mapKey, {
        _id: g._id,
        subjectId,
        studentId: g.studentId || null,
        studentName: g.studentName || "ไม่ทราบชื่อ",
        scores: g.scores || {},
        subScores: g.subScores || {}, // BUG FIX: Return subScores
        sequence: g.sequence,
        hasGradeRecord: true,
        updatedAt: g.updatedAt
      });
    });

    // Merge auto scores and add students who ONLY have auto scores
    autoScoresMap.forEach((scoresObj: any, studentId: string) => {
      let studentData = studentMap.get(studentId);
      if (!studentData) {
        const aInfo = attendancesWithScores.find(a => a.studentId === studentId);
        studentData = {
          _id: new ObjectId(),
          subjectId,
          studentId: studentId,
          studentName: aInfo?.studentName || "ไม่ทราบชื่อ",
          scores: {},
          subScores: {},
          hasGradeRecord: true, // Treat as having a grade so it gets calculated
          updatedAt: new Date().toISOString()
        };
        studentMap.set(studentId, studentData);
      }

      // Find categories
      const classWorkCat = config.categories.find((c: any) => c.id === "class_work" || c.name.includes("งานอื่น")) || config.categories[config.categories.length - 1];
      const midtermCat = config.categories.find((c: any) => c.name.includes("สอบกลางภาค") || c.id === "midterm_exam");
      const finalCat = config.categories.find((c: any) => c.name.includes("สอบปลายภาค") || c.id === "final_exam");
      const endChapterCat = config.categories.find((c: any) => c.name.includes("สอบท้ายบท") || c.name.includes("หลังเรียน") || c.id === "end_of_chapter_exam");
      
      // Helper to check if category has manual sub-scores
      const hasSubScores = (catId: string) => {
        return studentData.subScores && studentData.subScores[catId] && Object.keys(studentData.subScores[catId]).length > 0;
      };

      // Calculate scaled scores: Math.round((Earned / Max) * CategoryPoints)
      // Only apply auto-score if there are NO sub-scores explicitly set by the teacher
      if (classWorkCat && scoresObj.class_work.m > 0 && !hasSubScores(classWorkCat.id)) {
        const scaled = Math.round((scoresObj.class_work.s / scoresObj.class_work.m) * classWorkCat.points);
        studentData.scores[classWorkCat.id] = scaled;
      }
      
      if (midtermCat && scoresObj.midterm.m > 0 && !hasSubScores(midtermCat.id)) {
        const scaled = Math.round((scoresObj.midterm.s / scoresObj.midterm.m) * midtermCat.points);
        studentData.scores[`_dynamic_auto_${midtermCat.id}`] = scaled; // Mark it so it can be combined or override
        studentData.scores[midtermCat.id] = scaled;
      }
      
      if (finalCat && scoresObj.final.m > 0 && !hasSubScores(finalCat.id)) {
        const scaled = Math.round((scoresObj.final.s / scoresObj.final.m) * finalCat.points);
        studentData.scores[`_dynamic_auto_${finalCat.id}`] = scaled;
        studentData.scores[finalCat.id] = scaled;
      }

      if (endChapterCat && scoresObj.end_chapter.m > 0) {
        const scaled = Math.round((scoresObj.end_chapter.s / scoresObj.end_chapter.m) * endChapterCat.points);
        studentData.scores[`_dynamic_auto_${endChapterCat.id}`] = scaled;
        studentData.scores[endChapterCat.id] = scaled;
      }
    });

    // 2.5 Fetch all students in the allowed class groups to ensure the list is complete
    if (subject.allowedClassGroups) {
      const allowedGroups = parseAllowedClassGroups(subject.allowedClassGroups);
      console.log(`[DEBUG API] subjectId: ${subjectId}, allowedGroups:`, allowedGroups);
      
      if (allowedGroups.length > 0) {
        const allStudents = await db.collection("users").find({ role: "student" })
          .project({ _id: 1, name: 1, classGroupId: 1, groupCode: 1, classroomName: 1 })
          .toArray();

        console.log(`[DEBUG API] allStudents fetched: ${allStudents.length}`);
        let addedCount = 0;

        allStudents.forEach(student => {
          const studentGroup = resolveStudentClassGroup(student);
          if (studentGroup && allowedGroups.includes(studentGroup)) {
            const studentIdStr = student._id.toString();
            // Handle both ObjectId and string keys in studentMap
            let exists = false;
            for (const key of studentMap.keys()) {
              if (String(key) === studentIdStr) {
                exists = true;
                break;
              }
            }

            if (!exists) {
              addedCount++;
              studentMap.set(studentIdStr, {
                _id: new ObjectId(),
                subjectId,
                studentId: studentIdStr,
                studentName: student.name || "ไม่ทราบชื่อ",
                scores: {},
                subScores: {},
                hasGradeRecord: false,
                updatedAt: new Date().toISOString()
              });
            }
          }
        });
        console.log(`[DEBUG API] added missing students: ${addedCount}`);
      }
    }

    // 3. Get students who have submitted midterm/final quizzes
    const examQuizzes = await db.collection("dve_quizzes").find({ 
      subjectId, 
      quizType: { $in: ["midterm", "final"] } 
    }).toArray();
    
    if (examQuizzes.length > 0) {
      const quizIds = examQuizzes.map((q: any) => q._id.toString());
      const examSubmissions = await db.collection("dve_quiz_submissions").find({
        quizId: { $in: quizIds },
        score: { $exists: true, $nin: ["", null] }
      }).toArray();
      
      const midtermCat = config.categories.find((c: any) => c.name.includes("สอบกลางภาค") || c.id === "midterm_exam");
      const finalCat = config.categories.find((c: any) => c.name.includes("สอบปลายภาค") || c.id === "final_exam");
      
      examSubmissions.forEach((sub: any) => {
        const quiz = examQuizzes.find((q: any) => q._id.toString() === sub.quizId);
        if (!quiz || !sub.studentId) return;
        
        const cat = quiz.quizType === "midterm" ? midtermCat : finalCat;
        if (!cat) return;
        
        const scoreVal = Number(sub.score) || 0;
        const maxScoreVal = Number(sub.maxScore) || 1;
        const actualCatScore = Math.round((scoreVal / maxScoreVal) * cat.points);
        
        let studentData = studentMap.get(sub.studentId);
        if (!studentData) {
          studentData = {
            _id: new ObjectId(),
            subjectId,
            studentId: sub.studentId,
            studentName: sub.studentName || "ไม่ทราบชื่อ",
            scores: {},
            hasGradeRecord: true,
            updatedAt: new Date().toISOString()
          };
          studentMap.set(sub.studentId, studentData);
        }
        
        // Always prefer the dynamically calculated quiz score, overriding manual entry
        // If there are multiple quizzes of the same type, we accumulate them
        const existingScore = studentData.scores[`_dynamic_${cat.id}`] || 0;
        studentData.scores[`_dynamic_${cat.id}`] = existingScore + actualCatScore;
        studentData.scores[cat.id] = studentData.scores[`_dynamic_${cat.id}`];
      });
    }

    // Post-process: Give default max score for "จิตพิสัย" (mental_health) if it's missing
    const mentalHealthCat = config.categories.find((c: any) => c.id === "mental_health" || c.name.includes("จิตพิสัย"));
    if (mentalHealthCat) {
      studentMap.forEach(studentData => {
        if (studentData.scores[mentalHealthCat.id] === undefined || studentData.scores[mentalHealthCat.id] === null) {
          studentData.scores[mentalHealthCat.id] = mentalHealthCat.points; // Give max points by default
        }
      });
    }

    const studentIdsToFetch = Array.from(studentMap.keys())
      .filter((id: string) => ObjectId.isValid(id))
      .map((id: string) => new ObjectId(id));
      
    let userMap = new Map();
    if (studentIdsToFetch.length > 0) {
      const users = await db.collection("users")
        .find({ _id: { $in: studentIdsToFetch } })
        .project({ _id: 1, name: 1, classGroupId: 1, groupCode: 1, classroomName: 1, studentId: 1, studentIdNum: 1, department: 1 })
        .toArray();
      userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    }

    const allActiveStudents = Array.from(studentMap.values()).sort((a, b) => {
      const seqA = typeof a.sequence === 'number' ? a.sequence : 9999;
      const seqB = typeof b.sequence === 'number' ? b.sequence : 9999;
      if (seqA !== seqB) return seqA - seqB;
      return (a.studentName || "").localeCompare(b.studentName || "");
    });

    // Calculate final grades for each student
    const calculatedGrades = allActiveStudents.map((grade) => {
      let totalScore: number | string = "-";
      let finalGrade = "-";
      let gradeDescription = "รอการประเมิน";
      let isPassed: boolean | null = null;

      if (grade.hasGradeRecord) {
        totalScore = Math.round(config.categories.reduce((sum: number, cat: any) => {
          const categoryScore = grade.scores?.[cat.id] || 0;
          return sum + categoryScore;
        }, 0));

        finalGrade = "0";
        gradeDescription = "ไม่ผ่าน";
        for (const scale of config.gradeScale) {
          if (totalScore >= scale.minScore) {
            finalGrade = scale.grade;
            gradeDescription = scale.description;
            break;
          }
        }
        isPassed = totalScore >= config.passingScore;
      }

      const user = userMap.get(grade.studentId);
      const classGroupId = resolveStudentClassGroup(user) || "ไม่ระบุห้องเรียน";
      const department = user?.department || "ไม่ระบุแผนก";

      // รหัสนักศึกษาตัวเลขจริง (studentIdNum หรือ studentId ใน users collection)
      // ถ้าไม่ใช่ตัวเลขล้วน ให้ return เป็น string ว่าง
      const rawCode = user?.studentIdNum || user?.studentId || "";
      const studentCode = /^\d+$/.test(String(rawCode).trim()) ? String(rawCode).trim() : "";

      return {
        id: grade._id.toString(),
        studentId: grade.studentId,
        studentCode,
        sequence: grade.sequence,
        studentName: user?.name || grade.studentName,
        department,
        classGroupId,
        subjectId: grade.subjectId,
        scores: grade.scores || {},
        subScores: grade.subScores || {},
        totalScore,
        finalGrade,
        gradeDescription,
        isPassed,
        hasGradeRecord: grade.hasGradeRecord,
        updatedAt: grade.updatedAt || new Date().toISOString(),
      };
    });

    calculatedGrades.sort((a, b) => {
      // 1. Sort by department
      const deptA = a.department || "";
      const deptB = b.department || "";
      if (deptA !== deptB) return deptA.localeCompare(deptB, "th");

      // 2. Sort by classGroupId
      const classA = a.classGroupId || "";
      const classB = b.classGroupId || "";
      if (classA !== classB) return classA.localeCompare(classB, "th");

      // 3. Sort by sequence
      const seqA = typeof a.sequence === "number" ? a.sequence : 9999;
      const seqB = typeof b.sequence === "number" ? b.sequence : 9999;
      if (seqA !== seqB) return seqA - seqB;

      // 4. Sort by name
      return (a.studentName || "").localeCompare(b.studentName || "", "th");
    });

    return NextResponse.json({
      success: true,
      config: {
        categories: config.categories,
        totalPoints: config.totalPoints,
        passingScore: config.passingScore,
        gradeScale: config.gradeScale,
      },
      grades: calculatedGrades,
    });
  } catch (error: any) {
    console.error("[DVE Student Grades GET API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, studentName, scores, subScores } = body;
    let { studentId } = body;

    if (!subjectId || !studentName || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!studentId) {
      // Generate a new ID for manually added students
      studentId = new ObjectId().toString();
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = session.user.id || "";

    // Check if user owns the subject
    const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (role === "teacher" && subject.teacherId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get grading config
    let config: any = await db.collection("dve_grading_configs").findOne({ subjectId });
    if (!config) {
      config = DEFAULT_GRADING_CONFIG;
    }

    // Validate scores against config (Skip if only updating sequence)
    if (!body.isSequenceUpdateOnly) {
      for (const category of config.categories) {
        const score = scores[category.id];
        const hasSubCategories = category.subCategories && category.subCategories.length > 0;
        
        if (score === undefined || score === null) {
          if (category.required) {
            return NextResponse.json(
              { error: `Missing required score for category: ${category.name}` },
              { status: 400 }
            );
          }
        } else if (category.cannotDeduct && !hasSubCategories && score < category.points) {
          return NextResponse.json(
            { error: `Cannot deduct points from category: ${category.name}` },
            { status: 400 }
          );
        } else if (score < 0 || score > category.points) {
          return NextResponse.json(
            { error: `Invalid score for category ${category.name}: must be between 0 and ${category.points}` },
            { status: 400 }
          );
        }
      }
    }

    // Check if grade already exists
    const existing = await db.collection("dve_student_grades").findOne({
      subjectId,
      studentId,
    });

    if (existing) {
      // Update existing grade
      const updateData: any = {
        scores,
        subScores: subScores || {},
        studentName,
        updatedAt: new Date(),
      };
      if (body.sequence !== undefined) {
        updateData.sequence = Number(body.sequence);
      }
      await db.collection("dve_student_grades").updateOne(
        { subjectId, studentId },
        { $set: updateData }
      );

      return NextResponse.json({
        success: true,
        message: "อัปเดตคะแนนนักเรียนสำเร็จ",
        id: existing._id.toString(),
      });
    }

    // Create new grade record
    const insertData: any = {
      subjectId,
      studentId,
      studentName,
      scores,
      subScores: subScores || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (body.sequence !== undefined) {
      insertData.sequence = Number(body.sequence);
    }
    const result = await db.collection("dve_student_grades").insertOne(insertData);

    return NextResponse.json({
      success: true,
      message: "บันทึกคะแนนนักเรียนสำเร็จ",
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("[DVE Student Grades POST API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      scores,
      subScores,
      studentName,
      subjectId: bodySubjectId,
      studentId: bodyStudentId,
    } = body;

    if (!scores) {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = session.user.id || "";

    // 1. Try to find existing grade by _id
    let existing: any = null;
    if (id && ObjectId.isValid(id)) {
      existing = await db
        .collection("dve_student_grades")
        .findOne({ _id: new ObjectId(id) });
    }

    // 2. Fallback: find by subjectId + studentId
    //    (นักเรียนที่มีคะแนนจาก attendance เท่านั้น ยังไม่มี grade record จริง)
    if (!existing && bodySubjectId && bodyStudentId) {
      existing = await db.collection("dve_student_grades").findOne({
        subjectId: bodySubjectId,
        studentId: bodyStudentId,
      });
    }

    // Resolve subjectId from existing record or body
    const subjectId = existing?.subjectId || bodySubjectId;
    if (!subjectId) {
      return NextResponse.json(
        { error: "Missing subject information" },
        { status: 400 }
      );
    }

    // Check if user owns the subject
    const subject = await db
      .collection("dve_subjects")
      .findOne({ _id: new ObjectId(subjectId) });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (role === "teacher" && subject.teacherId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get grading config
    let config: any = await db
      .collection("dve_grading_configs")
      .findOne({ subjectId });
    if (!config) {
      config = DEFAULT_GRADING_CONFIG;
    }

    // Validate scores against config
    for (const category of config.categories) {
      const score = scores[category.id];
      const hasSubCategories = category.subCategories && category.subCategories.length > 0;
      
      if (score !== undefined && score !== null) {
        if (score < 0 || score > category.points) {
          return NextResponse.json(
            {
              error: `Invalid score for category ${category.name}: must be between 0 and ${category.points}`,
            },
            { status: 400 }
          );
        }
      }
    }

    if (existing) {
      // Update existing record
      await db.collection("dve_student_grades").updateOne(
        { _id: existing._id },
        {
          $set: {
            scores,
            subScores: subScores || {},
            ...(studentName && { studentName }),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // สร้าง record ใหม่ (upsert — นักเรียนที่มีแต่ attendance scores ได้รับการบันทึกคะแนนครั้งแรก)
      if (!bodyStudentId) {
        return NextResponse.json(
          { error: "Missing student ID" },
          { status: 400 }
        );
      }
      await db.collection("dve_student_grades").insertOne({
        subjectId,
        studentId: bodyStudentId,
        studentName: studentName || "ไม่ทราบชื่อ",
        scores,
        subScores: subScores || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตคะแนนนักเรียนสำเร็จ",
    });
  } catch (error: any) {
    console.error("[DVE Student Grades PUT API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = session.user.id || "";

    // Check if grade exists and user has access
    const existing = await db.collection("dve_student_grades").findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if user owns the subject
    const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(existing.subjectId) });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (role === "teacher" && subject.teacherId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_student_grades").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "ลบคะแนนนักเรียนสำเร็จ",
    });
  } catch (error: any) {
    console.error("[DVE Student Grades DELETE API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
