import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import clientPromise from "@/lib/db";
import { InternshipScreening } from "@/app/models/InternshipScreening";

// บันทึกข้อมูลคัดกรองฝึกงาน (POST)
export async function POST(req: Request) {
  try {
    await connectMongoose();
    const data = await req.json();

    const {
      name,
      studentId,
      department,
      classroom,
      age,
      gender,
      scores
    } = data;

    // Check Mental Risk Logic
    const mhResults = [
      { color: scores.st5Total >= 8 ? "text-orange-500" : (scores.st5Total >= 10 ? "text-red-500" : "text-emerald-500") },
      { color: scores.twoQTotal > 0 ? "text-orange-500" : "text-emerald-500" },
      { color: scores.q9Total >= 13 ? "text-orange-500" : (scores.q9Total >= 19 ? "text-red-500" : "text-emerald-500") },
      { color: scores.q8Total >= 9 ? "text-orange-500" : (scores.q8Total >= 17 ? "text-red-500" : "text-emerald-500") },
    ];

    // Note: q9Total and q8Total might be 0/undefined if they skipped it via early exit.
    const hasMentalRisk = mhResults.some(r => r.color === "text-red-500" || r.color === "text-orange-500");

    const softSkillsPercentage = (scores.softSkillsScore / scores.softSkillsTotal) * 100;

    const newScreening = new InternshipScreening({
      name,
      studentId,
      department,
      classroom: classroom || "",
      age,
      gender,
      st5Total: scores.st5Total,
      twoQTotal: scores.twoQTotal,
      q9Total: scores.q9Total || 0,
      q8Total: scores.q8Total || 0,
      softSkillsScore: scores.softSkillsScore,
      softSkillsTotal: scores.softSkillsTotal,
      mentalHealthRisk: hasMentalRisk,
      softSkillsPercentage: softSkillsPercentage
    });

    await newScreening.save();

    return NextResponse.json({ success: true, data: newScreening }, { status: 201 });
  } catch (error) {
    console.error("Error saving internship screening:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ดึงข้อมูลทั้งหมดไปแสดงใน Dashboard (GET)
export async function GET() {
  try {
    await connectMongoose();
    const screenings = await InternshipScreening.find().sort({ createdAt: -1 }).lean();

    // Fetch user images and ids from Native MongoDB driver
    const client = await clientPromise;
    const db = client.db();
    const studentIds = screenings.map(s => s.studentId);

    // Find users by studentId
    const users = await db.collection("users").find(
      { studentId: { $in: studentIds } },
      { projection: { _id: 1, studentId: 1, image: 1 } }
    ).toArray();

    const userMap = new Map();
    users.forEach((u: any) => {
      userMap.set(u.studentId, {
        userId: u._id.toString(),
        image: u.image
      });
    });

    const enrichedScreenings = screenings.map(s => {
      const userInfo = userMap.get(s.studentId);
      return {
        ...s,
        userId: userInfo?.userId || null,
        image: userInfo?.image || null
      };
    });

    return NextResponse.json({ success: true, data: enrichedScreenings });
  } catch (error) {
    console.error("Error fetching internship screenings:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
