import { NextResponse } from "next/server";
import { connectDB } from "@/models/TypingScore";
import { SnakeScore } from "@/models/SnakeScore";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    await connectDB();
    const topScores = await SnakeScore.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(10)
      .lean();
    return NextResponse.json({ success: true, topScores }, { status: 200 });
  } catch (error) {
    console.error("GET SnakeScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { score } = body;

    if (score === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 },
      );
    }

    await connectDB();

    const userId = session.user.id || session.user.name;
    let userImage = session.user.image || "";

    // ดึงรูปโปรไฟล์ล่าสุดจากฐานข้อมูลโดยตรง ป้องกันปัญหา Session ไม่อัปเดต
    if (session.user.id) {
      try {
        const client = await clientPromise;
        const db = client.db("ktltc_db");
        const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
        if (user && user.image) {
          userImage = user.image;
        }
      } catch (err) {
        console.error("Failed to fetch fresh user image:", err);
      }
    }

    // ค้นหาประวัติเดิมของผู้ใช้
    const existingScore = await SnakeScore.findOne({ userId });

    if (existingScore) {
      // ถ้ามีประวัติเดิม ให้เทียบ score ว่าเยอะกว่าเดิมไหม
      if (score > existingScore.score) {
        existingScore.score = score;
        existingScore.name = session.user.name || "Unknown User"; // Update name just in case
        existingScore.userImage = userImage;
        existingScore.createdAt = new Date();
        await existingScore.save();
        return NextResponse.json(
          { success: true, message: "New high score updated!", score: existingScore },
          { status: 200 },
        );
      } else {
        // อัปเดต userImage เผื่อเปลี่ยนรูปโปรไฟล์ แต่คะแนนเท่าเดิม
        existingScore.userImage = userImage;
        await existingScore.save();

        return NextResponse.json(
          {
            success: true,
            message: "Score did not beat previous high score",
            score: existingScore,
          },
          { status: 200 },
        );
      }
    } else {
      // ถ้ายังไม่มีประวัติให้สร้างใหม่
      const newScore = new SnakeScore({
        userId,
        name: session.user.name || "Unknown User",
        userImage,
        score,
      });

      await newScore.save();
      return NextResponse.json(
        { success: true, message: "Score saved!", score: newScore },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("POST SnakeScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
