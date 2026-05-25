import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

// Helpers to grade the quiz answers
function gradeQuiz(questions: any[], answers: any[]): { score: number; maxScore: number } {
  let totalScore = 0;
  let totalMaxScore = 0;

  for (const q of questions) {
    const points = Number(q.points) || 0;
    totalMaxScore += points;

    const studentAnsObj = answers.find((a) => a.questionId === q.id);
    if (!studentAnsObj) continue;

    const studentAns = studentAnsObj.answer;
    const correctAns = q.correctAnswer;

    if (!correctAns) continue; // No correct answer set for this question

    if (q.type === "multiple_choice" || q.type === "short_answer") {
      const sVal = String(studentAns || "").trim().toLowerCase();
      const cVal = String(correctAns || "").trim().toLowerCase();
      if (sVal === cVal && sVal !== "") {
        totalScore += points;
      }
    } else if (q.type === "checkboxes") {
      // Checkboxes answer is an array
      const sArr = Array.isArray(studentAns) ? studentAns.map(v => String(v || "").trim().toLowerCase()).sort() : [];
      const cArr = Array.isArray(correctAns) ? correctAns.map(v => String(v || "").trim().toLowerCase()).sort() : [String(correctAns || "").trim().toLowerCase()];
      
      if (sArr.length === cArr.length && sArr.every((v, i) => v === cArr[i]) && sArr.length > 0) {
        totalScore += points;
      }
    }
  }

  return { score: totalScore, maxScore: totalMaxScore };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id || "";
    const userName = session.user.name || "Student";
    const body = await req.json();
    const { quizId, answers } = body;

    if (!quizId || !ObjectId.isValid(quizId) || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Fetch the quiz details
    const quiz = await db.collection("dve_quizzes").findOne({ _id: new ObjectId(quizId) });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Auto-grade submissions
    const { score, maxScore } = gradeQuiz(quiz.questions || [], answers);

    // Save submission record
    const submissionResult = await db.collection("dve_quiz_submissions").insertOne({
      quizId,
      studentId: userId,
      studentName: userName,
      answers,
      score,
      maxScore,
      submittedAt: new Date(),
    });

    // Automatically update student's score inside DVE attendance
    // Find matching attendance for student and subject
    const subjectId = quiz.subjectId;
    const existingAttendance = await db.collection("dve_attendances").findOne({
      studentId: userId,
      subjectId: subjectId
    });

    if (existingAttendance) {
      await db.collection("dve_attendances").updateOne(
        { _id: existingAttendance._id },
        {
          $set: {
            assignmentStatus: "Submitted",
            score: score,
            maxScore: maxScore,
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Create a default attendance row with "Submitted" assignment status if none exists
      await db.collection("dve_attendances").insertOne({
        studentId: userId,
        studentName: userName,
        subjectId: subjectId,
        status: "Present", // default status
        assignmentStatus: "Submitted",
        score: score,
        maxScore: maxScore,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: "ส่งแบบทดสอบสำเร็จ",
      score,
      maxScore,
      submissionId: submissionResult.insertedId.toString()
    });

  } catch (error: any) {
    console.error("[DVE Submissions POST API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId")?.trim();

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const submissions = await db.collection("dve_quiz_submissions")
      .find({ quizId })
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      submissions: submissions.map((s) => ({
        id: s._id.toString(),
        quizId: s.quizId,
        studentId: s.studentId,
        studentName: s.studentName,
        answers: s.answers || [],
        score: s.score || 0,
        maxScore: s.maxScore || 0,
        submittedAt: s.submittedAt,
      }))
    });

  } catch (error: any) {
    console.error("[DVE Submissions GET API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
