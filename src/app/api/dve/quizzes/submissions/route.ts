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

    const studentAnsObj = answers.find((a) => String(a.questionId) === String(q.id));
    if (!studentAnsObj) continue;

    const studentAns = studentAnsObj.answer;

    if (q.type === "short_answer") {
      // If teacher has graded it, use their grade. Otherwise default to true (correct)!
      const teacherCorrect = studentAnsObj.isCorrect;
      const isCorrect = (teacherCorrect !== undefined) ? teacherCorrect : true;
      if (isCorrect) {
        totalScore += points;
      }
      studentAnsObj.isCorrect = isCorrect; // Persist back to the object
      continue;
    }

    const correctAns = q.correctAnswer;
    if (!correctAns) continue; // No correct answer set for this question

    if (q.type === "multiple_choice") {
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
    const { quizId, answers, fileUrl, fileName } = body;

    if (!quizId || !ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Missing or invalid quizId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Fetch the quiz details
    const quiz = await db.collection("dve_quizzes").findOne({ _id: new ObjectId(quizId) });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let score = 0;
    let maxScore = 0;
    const hasAnswers = Array.isArray(answers) && answers.length > 0;
    if (hasAnswers) {
      const graded = gradeQuiz(quiz.questions || [], answers);
      score = graded.score;
      maxScore = graded.maxScore;
    }

    // Check for existing quiz submission by this student
    const existingSubmission = await db.collection("dve_quiz_submissions").findOne({
      quizId,
      studentId: userId,
    });

    let scoreVal = score;
    let maxScoreVal = maxScore;
    let submissionId = "";

    if (existingSubmission) {
      submissionId = existingSubmission._id.toString();
      const updateData: any = {};
      if (hasAnswers) {
        updateData.answers = answers;
        updateData.score = score;
        updateData.maxScore = maxScore;
      } else {
        scoreVal = existingSubmission.score || 0;
        maxScoreVal = existingSubmission.maxScore || 0;
      }
      if (fileUrl) {
        updateData.fileUrl = fileUrl;
        updateData.fileName = fileName || "เอกสารเพิ่มเติม";
      }
      updateData.submittedAt = new Date();

      await db.collection("dve_quiz_submissions").updateOne(
        { _id: existingSubmission._id },
        { $set: updateData }
      );
    } else {
      const result = await db.collection("dve_quiz_submissions").insertOne({
        quizId,
        studentId: userId,
        studentName: userName,
        answers: answers || [],
        score: score || 0,
        maxScore: maxScore || 0,
        fileUrl: fileUrl || "",
        fileName: fileName || "",
        submittedAt: new Date(),
      });
      submissionId = result.insertedId.toString();
    }

    // Automatically update student's score & file inside DVE attendance
    const subjectId = quiz.subjectId;
    const existingAttendance = await db.collection("dve_attendances").findOne({
      studentId: userId,
      subjectId: subjectId
    });

    if (existingAttendance) {
      const updateFields: any = {
        assignmentStatus: "Submitted",
        score: scoreVal,
        maxScore: maxScoreVal,
        updatedAt: new Date()
      };
      if (fileUrl) {
        updateFields.imageUrl = fileUrl;
      }
      await db.collection("dve_attendances").updateOne(
        { _id: existingAttendance._id },
        { $set: updateFields }
      );
    } else {
      // Create a default attendance row with "Submitted" assignment status if none exists
      await db.collection("dve_attendances").insertOne({
        studentId: userId,
        studentName: userName,
        subjectId: subjectId,
        status: "Present", // default status
        assignmentStatus: "Submitted",
        imageUrl: fileUrl || "",
        score: scoreVal,
        maxScore: maxScoreVal,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: "ส่งข้อมูลเรียบร้อยแล้ว",
      score: scoreVal,
      maxScore: maxScoreVal,
      submissionId
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

    // Enrich submissions with classGroupId from users collection
    const enriched = await Promise.all(
      submissions.map(async (s) => {
        let classGroupId = "";
        try {
          if (s.studentId && ObjectId.isValid(s.studentId)) {
            const userDoc = await db.collection("users").findOne(
              { _id: new ObjectId(s.studentId) },
              { projection: { classGroupId: 1 } }
            );
            classGroupId = userDoc?.classGroupId || "";
          }
        } catch (_) {}
        return {
          id: s._id.toString(),
          quizId: s.quizId,
          studentId: s.studentId,
          studentName: s.studentName,
          classGroupId,
          answers: s.answers || [],
          score: s.score || 0,
          maxScore: s.maxScore || 0,
          fileUrl: s.fileUrl || "",
          fileName: s.fileName || "",
          submittedAt: s.submittedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      submissions: enriched,
    });

  } catch (error: any) {
    console.error("[DVE Submissions GET API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, questionId, isCorrect } = body;

    if (!submissionId || !ObjectId.isValid(submissionId) || !questionId) {
      return NextResponse.json({ error: "Missing or invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Fetch submission
    const submission = await db.collection("dve_quiz_submissions").findOne({
      _id: new ObjectId(submissionId)
    });
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Fetch quiz details
    const quiz = await db.collection("dve_quizzes").findOne({
      _id: new ObjectId(submission.quizId)
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Update the specific question's correctness in answers array
    const updatedAnswers = (submission.answers || []).map((ans: any) => {
      if (String(ans.questionId) === String(questionId)) {
        return { ...ans, isCorrect };
      }
      return ans;
    });

    // Re-calculate the score using the updated answers
    const { score, maxScore } = gradeQuiz(quiz.questions || [], updatedAnswers);

    // Update submission in database
    await db.collection("dve_quiz_submissions").updateOne(
      { _id: new ObjectId(submissionId) },
      { $set: { answers: updatedAnswers, score, maxScore, updatedAt: new Date() } }
    );

    // Update student's DVE attendance record score
    const subjectId = quiz.subjectId;
    await db.collection("dve_attendances").updateOne(
      { studentId: submission.studentId, subjectId },
      { $set: { score, maxScore, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: "อัปเดตผลการตรวจเรียบร้อยแล้ว",
      score,
      maxScore
    });
  } catch (error: any) {
    console.error("[DVE Submissions PATCH API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

