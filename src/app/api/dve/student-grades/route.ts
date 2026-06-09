import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

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
    const config = await db.collection("dve_grading_configs").findOne({ subjectId });
    if (!config) {
      return NextResponse.json({ error: "Grading configuration not found" }, { status: 404 });
    }

    // Build query for student grades
    const query: any = { subjectId };
    if (studentId) {
      query.studentId = studentId;
    }

    const grades = await db
      .collection("dve_student_grades")
      .find(query)
      .sort({ studentName: 1 })
      .toArray();

    // Calculate final grades for each student
    const calculatedGrades = grades.map((grade) => {
      const totalScore = config.categories.reduce((sum: number, cat: any) => {
        const categoryScore = grade.scores?.[cat.id] || 0;
        return sum + categoryScore;
      }, 0);

      // Determine grade based on grade scale
      let finalGrade = "0";
      let gradeDescription = "ไม่ผ่าน";
      for (const scale of config.gradeScale) {
        if (totalScore >= scale.minScore) {
          finalGrade = scale.grade;
          gradeDescription = scale.description;
          break;
        }
      }

      return {
        id: grade._id.toString(),
        studentId: grade.studentId,
        studentName: grade.studentName,
        subjectId: grade.subjectId,
        scores: grade.scores || {},
        totalScore,
        finalGrade,
        gradeDescription,
        isPassed: totalScore >= config.passingScore,
        updatedAt: grade.updatedAt,
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
    const { subjectId, studentId, studentName, scores } = body;

    if (!subjectId || !studentId || !studentName || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    const config = await db.collection("dve_grading_configs").findOne({ subjectId });
    if (!config) {
      return NextResponse.json({ error: "Grading configuration not found" }, { status: 404 });
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
    const { id, scores, studentName } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    if (!scores) {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 });
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

    // Get grading config
    const config = await db.collection("dve_grading_configs").findOne({ subjectId: existing.subjectId });
    if (!config) {
      return NextResponse.json({ error: "Grading configuration not found" }, { status: 404 });
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

    await db.collection("dve_student_grades").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          scores,
          ...(studentName && { studentName }),
          updatedAt: new Date(),
        },
      }
    );

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
