import { NextResponse } from "next/server";
import TypingScore, { connectDB } from "@/models/TypingScore";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    // Get Top 10 High Scores
    const topScores = await TypingScore.find()
      .sort({ wpm: -1, accuracy: -1, createdAt: 1 })
      .limit(10);
    return NextResponse.json({ success: true, topScores }, { status: 200 });
  } catch (error) {
    console.error("GET TypingScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to save score." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { wpm, accuracy } = body;

    if (wpm === undefined || accuracy === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: wpm, accuracy" },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = session.user.id || session.user.name;

    // ค้นหาประวัติเดิมของผู้ใช้
    const existingScore = await TypingScore.findOne({ userId });

    if (existingScore) {
      // ถ้ามีประวัติเดิม ให้เทียบ WPM ว่าเยอะกว่าเดิมไหม
      if (wpm > existingScore.wpm || (wpm === existingScore.wpm && accuracy > existingScore.accuracy)) {
        existingScore.wpm = wpm;
        existingScore.accuracy = accuracy;
        existingScore.name = session.user.name || "Unknown User"; // Update name just in case
        existingScore.createdAt = new Date();
        await existingScore.save();
        return NextResponse.json(
          { success: true, message: "New high score updated!", score: existingScore },
          { status: 200 }
        );
      } else {
        // คะแนนไม่มากกว่าเดิม ไม่ต้องอัปเดต
        return NextResponse.json(
          { success: true, message: "Score did not beat previous high score", score: existingScore },
          { status: 200 }
        );
      }
    } else {
      // ถ้ายังไม่มีประวัติให้สร้างใหม่
      const newScore = new TypingScore({
        userId,
        name: session.user.name || "Unknown User",
        wpm,
        accuracy,
      });
      await newScore.save();
      return NextResponse.json(
        { success: true, message: "Score saved successfully", score: newScore },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("POST TypingScore Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
