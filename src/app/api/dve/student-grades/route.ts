import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

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
      id: "midterm_exam",
      name: "สอบกลางภาค",
      points: 10,
      cannotDeduct: true,
      required: true,
      description: "การสอบกลางภาค",
    },
    {
      id: "end_of_chapter_exam",
      name: "สอบท้ายบท",
      points: 20,
      cannotDeduct: true,
      required: true,
      description: "การสอบท้ายบท",
    },
    {
      id: "project",
      name: "โปรเจครายวิชา",
      points: 20,
      cannotDeduct: false,
      required: false,
      description: "โปรเจครายวิชา",
    },
    {
      id: "class_work",
      name: "งานอื่นๆ (งานในคาบเรียน)",
      points: 30,
      cannotDeduct: false,
      required: false,
      description: "งานในคาบเรียนและกิจกรรมอื่นๆ",
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
      .project({ studentId: 1, studentName: 1, score: 1 })
      .toArray();

    // Sum quiz scores per student
    const autoScoresMap = new Map();
    attendancesWithScores.forEach((a: any) => {
      const s = Number(a.score);
      if (!isNaN(s) && a.studentId) {
        autoScoresMap.set(a.studentId, (autoScoresMap.get(a.studentId) || 0) + s);
      }
    });

    const studentMap = new Map();

    // Add students from explicit grades
    grades.forEach((g: any) => {
      if (g.studentId) {
        studentMap.set(g.studentId, {
          _id: g._id,
          subjectId,
          studentId: g.studentId,
          studentName: g.studentName || "ไม่ทราบชื่อ",
          scores: g.scores || {},
          hasGradeRecord: true,
          updatedAt: g.updatedAt
        });
      }
    });

    // Merge auto scores and add students who ONLY have auto scores
    attendancesWithScores.forEach((a: any) => {
      if (a.studentId) {
        let studentData = studentMap.get(a.studentId);
        if (!studentData) {
          studentData = {
            _id: new ObjectId(),
            subjectId,
            studentId: a.studentId,
            studentName: a.studentName || "ไม่ทราบชื่อ",
            scores: {},
            hasGradeRecord: true, // Treat as having a grade so it gets calculated
            updatedAt: new Date().toISOString()
          };
          studentMap.set(a.studentId, studentData);
        }

        // Find the ID for the "งานอื่นๆ" category (usually "class_work")
        const classWorkCat = config.categories.find((c: any) => c.id === "class_work" || c.name.includes("งานอื่น")) 
                             || config.categories[config.categories.length - 1];
        
        if (classWorkCat) {
           studentData.scores[classWorkCat.id] = autoScoresMap.get(a.studentId);
        }
      }
    });

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
        .project({ _id: 1, name: 1, classGroupId: 1, groupCode: 1, classroomName: 1, studentId: 1, studentIdNum: 1 })
        .toArray();
      userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    }

    const allActiveStudents = Array.from(studentMap.values()).sort((a, b) => 
      (a.studentName || "").localeCompare(b.studentName || "")
    );

    // Calculate final grades for each student
    const calculatedGrades = allActiveStudents.map((grade) => {
      let totalScore: number | string = "-";
      let finalGrade = "-";
      let gradeDescription = "รอการประเมิน";
      let isPassed: boolean | null = null;

      if (grade.hasGradeRecord) {
        totalScore = config.categories.reduce((sum: number, cat: any) => {
          const categoryScore = grade.scores?.[cat.id] || 0;
          return sum + categoryScore;
        }, 0);

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

      // รหัสนักศึกษาตัวเลขจริง (studentIdNum หรือ studentId ใน users collection)
      // ถ้าไม่ใช่ตัวเลขล้วน ให้ return เป็น string ว่าง
      const rawCode = user?.studentIdNum || user?.studentId || "";
      const studentCode = /^\d+$/.test(String(rawCode).trim()) ? String(rawCode).trim() : "";

      return {
        id: grade._id.toString(),
        studentId: grade.studentId,
        studentCode,
        studentName: user?.name || grade.studentName,
        classGroupId,
        subjectId: grade.subjectId,
        scores: grade.scores || {},
        totalScore,
        finalGrade,
        gradeDescription,
        isPassed,
        hasGradeRecord: grade.hasGradeRecord,
        updatedAt: grade.updatedAt || new Date().toISOString(),
      };
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
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, studentName, scores } = body;
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
    const userId = (session.user as any).id || "";

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

    // Validate scores against config
    for (const category of config.categories) {
      const score = scores[category.id];
      if (score === undefined || score === null) {
        if (category.required) {
          return NextResponse.json(
            { error: `Missing required score for category: ${category.name}` },
            { status: 400 }
          );
        }
      } else if (category.cannotDeduct && score < category.points) {
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

    // Check if grade already exists
    const existing = await db.collection("dve_student_grades").findOne({
      subjectId,
      studentId,
    });

    if (existing) {
      // Update existing grade
      await db.collection("dve_student_grades").updateOne(
        { subjectId, studentId },
        {
          $set: {
            scores,
            studentName,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "อัปเดตคะแนนนักเรียนสำเร็จ",
        id: existing._id.toString(),
      });
    }

    // Create new grade record
    const result = await db.collection("dve_student_grades").insertOne({
      subjectId,
      studentId,
      studentName,
      scores,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      scores,
      studentName,
      subjectId: bodySubjectId,
      studentId: bodyStudentId,
    } = body;

    if (!scores) {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any).id || "";

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
      if (score === undefined || score === null) {
        if (category.required) {
          return NextResponse.json(
            { error: `Missing required score for category: ${category.name}` },
            { status: 400 }
          );
        }
      } else if (category.cannotDeduct && score < category.points) {
        return NextResponse.json(
          { error: `Cannot deduct points from category: ${category.name}` },
          { status: 400 }
        );
      } else if (score < 0 || score > category.points) {
        return NextResponse.json(
          {
            error: `Invalid score for category ${category.name}: must be between 0 and ${category.points}`,
          },
          { status: 400 }
        );
      }
    }

    if (existing) {
      // Update existing record
      await db.collection("dve_student_grades").updateOne(
        { _id: existing._id },
        {
          $set: {
            scores,
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
    const role = ((session?.user as any)?.role || "").toLowerCase();

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
    const userId = (session.user as any).id || "";

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
