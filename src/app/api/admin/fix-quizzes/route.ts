import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Find subjects
    const subject31910 = await db.collection("dve_subjects").findOne({ subjectCode: "31910-2023" });
    const subject30001 = await db.collection("dve_subjects").findOne({ subjectCode: "30001-1003" });

    if (!subject31910 || !subject30001) {
      return NextResponse.json({ error: "Subjects not found" }, { status: 404 });
    }

    const s31910_id = subject31910._id.toString();
    const s30001_id = subject30001._id.toString();

    // Find quizzes in 31910-2023
    const quizzes = await db.collection("dve_quizzes").find({ subjectId: s31910_id }).toArray();

    // Keep "สอบปลายภาค (Final)" in 31910-2023, move others to 30001-1003
    // Also include "สอบปลายภาค" regardless of case/spacing
    const toMove = quizzes.filter(q => !q.title.includes("สอบปลาย"));
    const toKeep = quizzes.filter(q => q.title.includes("สอบปลาย"));

    const moveIds = toMove.map(q => q._id);

    if (moveIds.length > 0) {
      await db.collection("dve_quizzes").updateMany(
        { _id: { $in: moveIds } },
        { $set: { subjectId: s30001_id } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "ย้ายแบบทดสอบอื่นๆ กลับไปยัง 30001-1003 เรียบร้อยแล้ว",
      keptQuizzes: toKeep.map(q => q.title),
      movedQuizzes: toMove.map(q => q.title),
      movedQuizzesCount: moveIds.length
    });
  } catch (error: any) {
    console.error("Error migrating quizzes:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
