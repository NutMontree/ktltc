import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

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
      required: true,
      description: "โปรเจครายวิชา",
    },
    {
      id: "class_work",
      name: "งานอื่นๆ (งานในคาบเรียน)",
      points: 30,
      cannotDeduct: false,
      required: true,
      description: "งานในคาบเรียนและกิจกรรมอื่นๆ",
    },
  ],
  totalPoints: 100,
  passingScore: 60,
  gradeScale: [
    { minScore: 80, grade: "4", description: "ดีมาก" },
    { minScore: 70, grade: "3", description: "ดี" },
    { minScore: 60, grade: "2", description: "พอใช้" },
    { minScore: 50, grade: "1", description: "ผ่านขั้นต่ำ" },
    { minScore: 0, grade: "0", description: "ไม่ผ่าน" },
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

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    if (subjectId) {
      // Get grading config for specific subject
      if (!ObjectId.isValid(subjectId)) {
        return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
      }

      // Check if user has access to this subject
      const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 });
      }

      if (userRole === "teacher" && subject.teacherId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const config = await db.collection("dve_grading_configs").findOne({ subjectId });
      
      if (!config) {
        // Return default config if none exists
        return NextResponse.json({
          success: true,
          config: {
            ...DEFAULT_GRADING_CONFIG,
            subjectId,
            isDefault: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        config: {
          id: config._id.toString(),
          subjectId: config.subjectId,
          categories: config.categories,
          totalPoints: config.totalPoints,
          passingScore: config.passingScore,
          gradeScale: config.gradeScale,
          isDefault: false,
        },
      });
    }

    // Get all grading configs for teacher
    if (userRole === "teacher") {
      const configs = await db
        .collection("dve_grading_configs")
        .find({ teacherId: userId })
        .toArray();

      return NextResponse.json({
        success: true,
        configs: configs.map((c) => ({
          id: c._id.toString(),
          subjectId: c.subjectId,
          categories: c.categories,
          totalPoints: c.totalPoints,
          passingScore: c.passingScore,
          gradeScale: c.gradeScale,
        })),
      });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error: any) {
    console.error("[DVE Grading Config GET API] Error:", error);
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
    const { subjectId, categories, totalPoints, passingScore, gradeScale } = body;

    if (!subjectId || !categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate that total points equal 100
    const calculatedTotal = categories.reduce((sum: number, cat: any) => sum + (cat.points || 0), 0);
    if (calculatedTotal !== 100) {
      return NextResponse.json(
        { error: `Total points must equal 100 (current: ${calculatedTotal})` },
        { status: 400 }
      );
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

    // Check if config already exists
    const existing = await db.collection("dve_grading_configs").findOne({ subjectId });

    if (existing) {
      // Update existing config
      await db.collection("dve_grading_configs").updateOne(
        { subjectId },
        {
          $set: {
            categories,
            totalPoints,
            passingScore: passingScore || 60,
            gradeScale: gradeScale || DEFAULT_GRADING_CONFIG.gradeScale,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "อัปเดตการตั้งค่าการให้คะแนนสำเร็จ",
        id: existing._id.toString(),
      });
    }

    // Create new config
    const result = await db.collection("dve_grading_configs").insertOne({
      subjectId,
      teacherId: userId,
      categories,
      totalPoints,
      passingScore: passingScore || 60,
      gradeScale: gradeScale || DEFAULT_GRADING_CONFIG.gradeScale,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "สร้างการตั้งค่าการให้คะแนนสำเร็จ",
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("[DVE Grading Config POST API] Error:", error);
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
    const { id, categories, totalPoints, passingScore, gradeScale } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate that total points equal 100
    const calculatedTotal = categories.reduce((sum: number, cat: any) => sum + (cat.points || 0), 0);
    if (calculatedTotal !== 100) {
      return NextResponse.json(
        { error: `Total points must equal 100 (current: ${calculatedTotal})` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any).id || "";

    // Check if config exists and user owns it
    const existing = await db.collection("dve_grading_configs").findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    if (role === "teacher" && existing.teacherId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_grading_configs").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          categories,
          totalPoints,
          passingScore: passingScore || 60,
          gradeScale: gradeScale || DEFAULT_GRADING_CONFIG.gradeScale,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "อัปเดตการตั้งค่าการให้คะแนนสำเร็จ",
    });
  } catch (error: any) {
    console.error("[DVE Grading Config PUT API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }
}
